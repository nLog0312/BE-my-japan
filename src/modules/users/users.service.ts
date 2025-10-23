import aqp from 'api-query-params';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { comparePasswordHelper, hashPasswordHelper, ResponseDto } from '@/helpers/util';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs'
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto, FindUserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { deepMerge } from '@/helpers/deep-merge.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService
  ) {}

  isEmailExist = async(email: string) => {
    const user = await this.userModel.exists({email});
    return !!user;
  }

  isUserNameExist = async(user_name: string) => {
    const user = await this.userModel.exists({user_name});
    return !!user;
  }

  sendMail(receivers: string[], subject: string, template: string, context: {}) {
    try {
      this.mailerService.sendMail({
        to: receivers,
        subject: subject,
        template: template,
        context: context
      })
      .then(() => {
        return 'success';
      })
      .catch((error) => {
        return error;
      });
    } catch (error) {
      return error;
    }
  }
  
  async register(createUserDto: CreateUserDto): Promise<ResponseDto> {
    try {
      const { user_name, email, password, name, locale } = createUserDto;
      
      // check mail
      if (email) {
        const isExistEmail = await this.isEmailExist(email);
        if(isExistEmail)
          return {
            message: `Email "${email}" đã tồn tại`,
            statusCode: 400,
          };
      }
      
      // check user_name
      const isUserNameExist = await this.isUserNameExist(user_name);
      if(isUserNameExist)
        return {
          message: `Tài khoản "${user_name}" đã tồn tại.`,
          statusCode: 400,
        };
      
      // hash Password
      const password_hash = await hashPasswordHelper(password);

      let registerUser: User = {
        user_name, email, password_hash, name, locale
      };

      const code_id = uuidv4();
      if(email) {
        registerUser.is_active_email = false;
        registerUser.code_id = code_id;
        registerUser.code_expired = dayjs().add(5, 'minutes').toString();
      }
      
      const user = await this.userModel.create(registerUser);

      // send mail
      if(email) {
        let subject = 'Kích hoạt tài khoản của bạn tại MyJapan.';
        let template = 'register.vi.hbs';
        if(locale == 'ja') {
          subject = 'MyJapanでアカウントを有効化してください';
          template = 'register.ja.hbs';
        }
        this.sendMail(
          [email],
          subject,
          template,
          {
            name: name ?? email,
            activation_code: code_id
          }
        )
      }

      const payload = { sub: user._id, username: user.user_name, name: user.name };
      return {
        message: `Đăng ký thành công với tên tài khoản: ${user_name}.`,
        statusCode: 201,
        data: {
          user: {
            _id: user._id,
            username: user.user_name,
            email: user.email,
            name: user.name
          },
          access_token: this.jwtService.sign(payload),
        }
      };
    } catch (error) {
      return error
    }
  }

  async findAll(query, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if(filter.current) delete filter.current;
    if(filter.pageSize) delete filter.pageSize;

    if(!current) current = 1;
    if(!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * (+pageSize);

    const results = await this.userModel
    .find(filter)
    .limit(pageSize)
    .skip(skip)
    .select('-password_hash')
    .sort(sort as any);

    return {
      results,
      totalPages
    };
  }

  async findOne(user_name: string) {
    return await this.userModel.findOne({ user_name: user_name });
  }

  async findOneById(id: string): Promise<ResponseDto<FindUserDto>> {
    try {
      const user = await this.userModel.findOne({ _id: id });
      return {
        message: 'Lấy thông tin người dùng thành công.',
        statusCode: 200,
        data: plainToInstance(FindUserDto, user, { excludeExtraneousValues: true }),
      };
    } catch (error) {
      return {
        message: `Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async update(updateUserDto: UpdateUserDto): Promise<ResponseDto> {
    const { _id, ...patch } = updateUserDto;

    if (!mongoose.isValidObjectId(_id)) {
      return { message: `Id: ${_id} không đúng định dạng.`, statusCode: 400 };
    }

    try {
      if (patch.email) {
        const isExistEmail = await this.userModel.exists({
          email: patch.email,
          _id: { $ne: _id },
        });

        if (isExistEmail) {
          return {
            message: `Email "${patch.email}" đã tồn tại.`,
            statusCode: 400,
          };
        }
      }

      const currentUser = await this.userModel.findById(_id);
      if (!currentUser) {
        return { message: 'Không tìm thấy người dùng.', statusCode: 404 };
      }

      const merged = deepMerge(currentUser.toObject(), patch);

      const user = await this.userModel.findByIdAndUpdate(
        _id,
        { $set: merged },
        { new: true, runValidators: true }
      );

      const payload = { sub: user._id, username: user.user_name, name: user.name };
      const access_token = this.jwtService.sign(payload);

      return {
        message: 'Sửa thông tin thành công.',
        statusCode: 200,
        data: { access_token },
      };
    } catch (error) {
      return {
        message: `Sửa thông tin không thành công. Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<ResponseDto> {
    const { _id, old_password, new_password } = changePasswordDto;

    if (!mongoose.isValidObjectId(_id)) {
      return { message: `Id: ${_id} không đúng định dạng.`, statusCode: 400 };
    }

    try {
      // check correct password
      const user = await this.userModel.findOne({ _id: _id });
      const isValidPassword = user ? await comparePasswordHelper(old_password, user?.password_hash) : null;
      if (!isValidPassword) {
        return { message: 'Mật khẩu cũ không đúng.', statusCode: 400 };
      }
      // hash Password
      const password_hash = await hashPasswordHelper(new_password);
      
      const userUpdate = await this.userModel.findByIdAndUpdate(
        _id,
        { password_hash: password_hash },
        { new: true, runValidators: true }
      );

      if (!userUpdate)
        return { message: 'Không tìm thấy người dùng.', statusCode: 404 };

      return {
        message: 'Đổi mật khẩu thành công.',
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: `Đổi mật khẩu không thành công. Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async remove(id: string) {
    if(mongoose.isValidObjectId(id)) {
      return await this.userModel.deleteOne({ _id: id })
    }
    throw new BadRequestException(`Id: ${id} không đúng định dạng.`)
  }
}
