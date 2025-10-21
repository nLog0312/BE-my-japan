import { comparePasswordHelper, ResponseDto } from '@/helpers/util';
import { UsersService } from '@/modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const isValidPassword = user ? await comparePasswordHelper(pass, user?.password_hash) : null;
    if (!user || !isValidPassword) {
      return null;
    }

    return user;
  }

  async login(user: any): Promise<ResponseDto> {
    if (!user)
      return {
        message: 'Sai tài khoản hoặc mật khẩu.',
        statusCode: 401,
      };
    const payload = { sub: user._id, username: user.user_name, name: user.name };
    return {
      message: 'Đăng nhập thành công.',
      statusCode: 200,
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
  }

  async register(registerDto: AuthDto) {
    return await this.usersService.register(registerDto);
  }
}