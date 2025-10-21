import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ResponseDto } from '@/helpers/util';
import mongoose, { Model } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import aqp from 'api-query-params';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly toDoModel: Model<TodoDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<ResponseDto> {
    if (!mongoose.isValidObjectId(createTodoDto.user_id))
      return { message: `Id: ${createTodoDto.user_id} không đúng định dạng.`, statusCode: 400 };

    try {
      // check user
      const user = await this.userModel.findOne({ _id: createTodoDto.user_id });
      if(!user)
        return { message: "Không tìm thấy tài khoản nào hiện đang được đăng nhập. Xin hãy đăng nhập lại!", statusCode: 400 };

      const monthSheet = await this.toDoModel.create({...createTodoDto});
      
      return {
        message: `Tạo mới việc cần làm thành công.`,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: `Tạo mới việc cần làm không thành công. Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async findAll(rawQuery, current: number, pageSize: number): Promise<ResponseDto> {
    try {
      const { filter, sort } = aqp(rawQuery);
  
      delete filter.current;
      delete filter.pageSize;
  
      if (!current) current = 1;
      if (!pageSize) pageSize = 10;

      let where: any = { ...filter };
      if (filter.title)
        where.title = { $regex: filter.title, $options: 'i' }
  
      const totalItems = await this.toDoModel.countDocuments(where);
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;
  
      const results = await this.toDoModel
        .find(where)
        .limit(pageSize)
        .skip(skip)
        .select('-user_id -updatedAt -__v')
        .sort(sort as any)
        .lean();
  
      return {
        message: 'Lấy thông tin việc cần làm thành công.',
        statusCode: 200,
        data: { results, totalPages },
      };
    } catch (error) {
      return { message: error.message || 'Internal error', statusCode: 400 };
    }
  }

  async findOneById(_id: string): Promise<ResponseDto> {
    try {
      const toDo = await this.toDoModel
        .findOne({ _id: _id })
        .select('-user_id -updatedAt -__v');

      if (!toDo)
        return {
          message: 'Không tìm thấy việc cần làm.',
          statusCode: 400
        };
      
      return {
        message: 'Lấy thông tin việc cần làm thành công.',
        statusCode: 200,
        data: toDo,
      };
    } catch (error) {
      return {
        message: `Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async update(updateTodoDto: UpdateTodoDto) {
    const { _id, ...patch } = updateTodoDto;
    
    if (!mongoose.isValidObjectId(_id)) {
      return { message: `Id: ${_id} không đúng định dạng.`, statusCode: 400 };
    }

    try {
      const monthSheet = await this.toDoModel.findByIdAndUpdate(
        _id,
        { $set: patch },
        { new: true, runValidators: true }
      );

      if (!monthSheet) {
        return { message: 'Không tìm thấy việc cần làm.', statusCode: 404 };
      }

      return {
        message: 'Sửa việc cần làm thành công.',
        statusCode: 200
      };
    } catch (error) {
      return {
        message: `Sửa việc cần làm không thành công. Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async remove(_id: string): Promise<ResponseDto> {
    try {
      const workLog = await this.toDoModel.deleteOne({ _id: _id });
      if (workLog.deletedCount > 0)
        return {
          message: 'Xoá việc cần làm thành công.',
          statusCode: 200,
        };
      else
        return {
          message: 'Việc cần làm đã bị xoá trước đó.',
          statusCode: 400,
        };
    } catch (error) {
      return {
        message: `Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }
}
