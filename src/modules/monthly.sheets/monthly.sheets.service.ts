import { Injectable } from '@nestjs/common';
import { CreateMonthlySheetDto } from './dto/create-monthly.sheet.dto';
import { UpdateMonthlySheetDto } from './dto/update-monthly.sheet.dto';
import { MonthlySheet, MonthlySheetDocument } from './schemas/monthly.sheet.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { dayRangeISO, fromToISO, monthRangeISO, ResponseDto, yearRangeISO } from '@/helpers/util';
import aqp from 'api-query-params';

@Injectable()
export class MonthlySheetsService {
  constructor(
    @InjectModel(MonthlySheet.name) private readonly monthSheetModel: Model<MonthlySheetDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createMonthlySheetDto: CreateMonthlySheetDto): Promise<ResponseDto> {
    if (!mongoose.isValidObjectId(createMonthlySheetDto.user_id))
      return { message: `Id: ${createMonthlySheetDto.user_id} không đúng định dạng.`, statusCode: 400 };

    try {
      // check user
      const user = await this.userModel.findOne({ _id: createMonthlySheetDto.user_id });
      if(!user)
        return { message: "Không tìm thấy tài khoản nào hiện đang được đăng nhập. Xin hãy đăng nhập lại!", statusCode: 400 };

      const monthSheet = await this.monthSheetModel.create({...createMonthlySheetDto});
      
      const date = new Date(monthSheet.entry_date);

      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // tháng bắt đầu từ 0
      const year = date.getUTCFullYear();
      return {
        message: `Tạo mới thu/chi cho ngày ${day}-${month}-${year} thành công.`,
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: `Tạo mới thu/chi không thành công. Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  // day=2025-10-18
  // month=2025-10
  // year=2025
  // from=2025-10-01&to=2025-10-18
  async findAll(rawQuery, current: number, pageSize: number): Promise<ResponseDto> {
    try {
      const { filter, sort } = aqp(rawQuery);
  
      const { day, month, year, from, to } = (rawQuery || {}) as {
        day?: string; month?: string; year?: string; from?: string; to?: string;
      };
  
      delete filter.current;
      delete filter.pageSize;
      delete filter.day;
      delete filter.month;
      delete filter.year;
      delete filter.from;
      delete filter.to;
  
      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
  
      let dkRange: { start: string; end: string } | null = null;
      if (day)        dkRange = dayRangeISO(day);
      else if (month) dkRange = monthRangeISO(month);    // "YYYY-MM"
      else if (year)  dkRange = yearRangeISO(year);      // "YYYY"
      else if (from && to) dkRange = fromToISO(from, to);// "YYYY-MM-DD"
  
      let where: any = { ...filter };
      if (dkRange && !day) {
        where.entry_date = { $gte: dkRange.start, $lte: dkRange.end };
      }
      if (dkRange && day) {
        where.entry_date = { $gte: dkRange.start, $lt: dkRange.end };
      }
  
      const totalItems = await this.monthSheetModel.countDocuments(where);
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;
  
      const results = await this.monthSheetModel
        .find(where)
        .limit(pageSize)
        .skip(skip)
        .select('-updatedAt -__v')
        .sort(sort as any)
        .lean();
  
      return {
        message: 'Lấy thông tin thu/chi thành công.',
        statusCode: 200,
        data: { results, totalPages },
      };
    } catch (error) {
      return { message: error.message || 'Internal error', statusCode: 400 };
    }
  }

  async findOneById(_id: string): Promise<ResponseDto> {
    try {
      const monthSheet = await this.monthSheetModel
        .findOne({ _id: _id })
        .select('-user_id -__v -createdAt -updatedAt');

      if (!monthSheet)
        return {
          message: 'Không tìm thấy thu/chi.',
          statusCode: 400
        };
      
      return {
        message: 'Lấy thông tin thu/chi thành công.',
        statusCode: 200,
        data: monthSheet,
      };
    } catch (error) {
      return {
        message: `Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async update(updateMonthlySheetDto: UpdateMonthlySheetDto) {
    const { _id, ...patch } = updateMonthlySheetDto;
    
    if (!mongoose.isValidObjectId(_id)) {
      return { message: `Id: ${_id} không đúng định dạng.`, statusCode: 400 };
    }

    try {
      const monthSheet = await this.monthSheetModel.findByIdAndUpdate(
        _id,
        { $set: patch },
        { new: true, runValidators: true }
      );

      if (!monthSheet) {
        return { message: 'Không tìm thấy thu/chi.', statusCode: 404 };
      }

      return {
        message: 'Sửa thu/chi thành công.',
        statusCode: 200
      };
    } catch (error) {
      return {
        message: `Sửa thu/chi không thành công. Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async remove(_id: string): Promise<ResponseDto> {
    try {
      const workLog = await this.monthSheetModel.deleteOne({ _id: _id });
      if (workLog.deletedCount > 0)
        return {
          message: 'Xoá thu/chi thành công.',
          statusCode: 200,
        };
      else
        return {
          message: 'Thu/chi đã bị xoá trước đó.',
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
