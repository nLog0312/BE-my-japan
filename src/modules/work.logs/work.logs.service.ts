import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWorkLogDto } from './dto/create-work.log.dto';
import { UpdateWorkLogDto } from './dto/update-work.log.dto';
import { dayRangeISO, fromToISO, monthRangeISO, ResponseDto, yearRangeISO } from '@/helpers/util';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WorkLog, WorkLogDocument } from './schemas/work.log.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import aqp from 'api-query-params';

@Injectable()
export class WorkLogsService {
  constructor(
    @InjectModel(WorkLog.name) private readonly workLogModel: Model<WorkLogDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService
  ) {}

  private parseDate(time: unknown, tz: string): DateTime {
    if (typeof time === 'string') {
      let dt = DateTime.fromISO(time, { setZone: true });
      if (!dt.isValid) dt = DateTime.fromRFC2822(time, { setZone: true });
      if (!dt.isValid) dt = DateTime.fromSQL(time, { setZone: true });

      if (!dt.isValid && /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(time)) {
        dt = DateTime.fromFormat(time, 'yyyy-LL-dd HH:mm[:ss]', { zone: tz });
      }

      if (!dt.isValid) {
        throw new BadRequestException(
          `start_time không hợp lệ: ${dt.invalidReason ?? ''} ${dt.invalidExplanation ?? ''}`.trim(),
        );
      }
      return dt;
    }

    // 2) Nếu là Date object
    if (time instanceof Date) {
      const dt = DateTime.fromJSDate(time);
      if (!dt.isValid) {
        throw new BadRequestException('start_time không phải Date hợp lệ.');
      }
      return dt;
    }

    // 3) Nếu là number timestamp
    if (typeof time === 'number') {
      const dt = DateTime.fromMillis(time);
      if (!dt.isValid) {
        throw new BadRequestException('start_time (millis) không hợp lệ.');
      }
      return dt;
    }

    throw new BadRequestException('start_time thiếu hoặc sai kiểu.');
  }

  async create(createWorkLogDto: CreateWorkLogDto): Promise<ResponseDto> {
    if (!mongoose.isValidObjectId(createWorkLogDto.user_id))
      return { message: `Id: ${createWorkLogDto.user_id} không đúng định dạng.`, statusCode: 400 };

    try {
      // check user
      const user = await this.userModel.findOne({ _id: createWorkLogDto.user_id });
      if(!user)
        return { message: "Không tìm thấy tài khoản nào hiện đang được đăng nhập. Xin hãy đăng nhập lại!", statusCode: 400 };

      const TZ = (this.configService.get<string>('TZ') ?? 'Asia/Tokyo').trim();;
      
      const dt = this.parseDate(createWorkLogDto.start_time ?? createWorkLogDto.start_time, TZ)
      const dayKey = dt.toFormat('yyyy-LL-dd');
      const workLog = await this.workLogModel.create({...createWorkLogDto, dayKey});
      return {
        message: `Tạo giờ làm cho ngày ${dt.toFormat('dd/MM/yyyy')} thành công.`,
        statusCode: 200,
      };
    } catch (error) {
      if (error?.code === 11000) {
        return {
          message: "Bạn đã tạo giờ làm cho hôm nay rồi.",
          statusCode: 400,
        };
      }
      return {
        message: `Tạo mới Worklog không thành công. Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async addDailyRecordsForAllUsers() {
    const users = await this.userModel.find();
    let createWorkLogDto: any = {
      break_minutes: 60,
      regular_hours: 8
    }

    const TZ = (this.configService.get<string>('TZ') ?? 'Asia/Tokyo').trim();;
    const today = DateTime.now().setZone(TZ).startOf('day');
    const dt = this.parseDate(today.toISO(), TZ)
    const dayKey = dt.toFormat('yyyy-LL-dd');
    for (const user of users) {
      if (user.setup_worklog.auto) {
        const [startHour, startMinute] = (user.setup_worklog?.start_time ?? '7:00').split(':').map(Number);
        const [endHour, endMinute] = (user.setup_worklog?.end_time ?? '16:00').split(':').map(Number);
  
        createWorkLogDto.user_id = user._id;
        createWorkLogDto.start_time = today.set({ hour: startHour, minute: startMinute }).toISO();
        createWorkLogDto.end_time = today.set({ hour: endHour, minute: endMinute }).toISO();
  
        createWorkLogDto.hourly_rate = user.setup_worklog?.hourly_rate ?? 1300;
        createWorkLogDto.dayKey = dayKey;
  
        const workLog = await this.workLogModel.create({...createWorkLogDto, dayKey});
      }
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
        where.dayKey = { $gte: dkRange.start, $lte: dkRange.end };
      }
      if (dkRange && day) {
        where.dayKey = { $gte: dkRange.start, $lt: dkRange.end };
      }
  
      const totalItems = await this.workLogModel.countDocuments(where);
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;
  
      const results = await this.workLogModel
        .find(where)
        .limit(pageSize)
        .skip(skip)
        .select('-dayKey -__v')
        .sort(sort as any)
        .lean();
  
      return {
        message: 'Lấy thông tin giờ làm thành công',
        statusCode: 200,
        data: { results, totalPages },
      };
    } catch (error) {
      return { message: error.message || 'Internal error', statusCode: 400, data: null };
    }
  }

  //#region Update
  toYMD(d: Date) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  parseTimeOnly(t: string): { h: number; m: number; s: number } | null {
    // "HH:mm" | "HH:mm:ss"
    const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(t);
    if (!m) return null;
    const h = +m[1], mm = +m[2], ss = +(m[3] ?? 0);
    if (h > 23 || mm > 59 || ss > 59) return null;
    return { h, m: mm, s: ss };
  }

  combineUTC(ymd: string, t: {h:number;m:number;s:number}) {
    const [y, mo, d] = ymd.split('-').map(Number);
    return new Date(Date.UTC(y, mo - 1, d, t.h, t.m, t.s, 0));
  }
  async update(updateWorkLogDto: UpdateWorkLogDto): Promise<ResponseDto> {
    const { _id, ...patch } = updateWorkLogDto;
    
    if (!mongoose.isValidObjectId(_id))
      return { message: `Id: ${_id} không đúng định dạng.`, statusCode: 400 };

    try {
      const doc = await this.workLogModel
        .findById(_id)
        .select('dayKey start_time end_time')
        .lean<{ dayKey: string; start_time: Date; end_time: Date }>()
      if (!doc) {
        return { message: 'Không tìm thấy giờ làm.', statusCode: 404 };
      }

      const baseYMD: string = doc.dayKey;

      // --- Xử lý start_time ---
      if (updateWorkLogDto.start_time !== undefined) {
        let newStart: Date | null = null;

        if (typeof updateWorkLogDto.start_time === 'string') {
          const timeOnly = this.parseTimeOnly(updateWorkLogDto.start_time);
          if (timeOnly) {
            // Client gửi "HH:mm[:ss]" -> gộp vào ngày chuẩn
            newStart = this.combineUTC(baseYMD, timeOnly);
          } else {
            // Có thể client gửi ISO -> kiểm tra ngày
            const dt = new Date(updateWorkLogDto.start_time);
            if (isNaN(dt.getTime())) {
              return { message: 'Thời gian bắt đầu không hợp lệ (HH:mm hoặc ISO8601).', statusCode: 400 };
            }
            const ymd = this.toYMD(dt);
            if (ymd !== baseYMD) {
              return { message: 'Không được sửa ngày của giờ làm, chỉ được sửa giờ.', statusCode: 400 };
            }

            newStart = dt;
          }
        } else if (updateWorkLogDto.start_time instanceof Date) {
          const ymd = this.toYMD(updateWorkLogDto.start_time);
          if (ymd !== baseYMD) {
            return { message: 'Không được sửa ngày của giờ làm, chỉ được sửa giờ.', statusCode: 400 };
          }
          newStart = updateWorkLogDto.start_time;
        }

        if (newStart) patch.start_time = newStart;
        else return { message: 'Thời gian bắt đầu không hợp lệ.', statusCode: 400 };
      }

      // --- Xử lý end_time ---
      if (updateWorkLogDto.end_time !== undefined) {
        let newEnd: Date | null = null;

        if (typeof updateWorkLogDto.end_time === 'string') {
          const timeOnly = this.parseTimeOnly(updateWorkLogDto.end_time);
          if (timeOnly) {
            newEnd = this.combineUTC(baseYMD, timeOnly);
          } else {
            const dt = new Date(updateWorkLogDto.end_time);
            if (isNaN(dt.getTime())) {
              return { message: 'Thời gian kết thúc không hợp lệ (HH:mm hoặc ISO8601).', statusCode: 400 };
            }
            const ymd = this.toYMD(dt);
            if (ymd !== baseYMD) {
              return { message: 'Không được sửa ngày của giờ làm, chỉ được sửa giờ.', statusCode: 400 };
            }
            newEnd = dt;
          }
        } else if (updateWorkLogDto.end_time instanceof Date) {
          const ymd = this.toYMD(updateWorkLogDto.end_time);
          if (ymd !== baseYMD) {
            return { message: 'Không được sửa ngày của giờ làm, chỉ được sửa giờ.', statusCode: 400 };
          }
          newEnd = updateWorkLogDto.end_time;
        }

        if (newEnd) patch.end_time = newEnd;
        else return { message: 'Thời gian kết thúc không hợp lệ.', statusCode: 400 };
      }

      if (updateWorkLogDto.start_time && updateWorkLogDto.end_time) {
        const finalStart: Date = new Date(patch.start_time) ?? new Date(doc.start_time);
        const finalEnd: Date = new Date(patch.end_time)   ?? new Date(doc.end_time);
  
        if (this.toYMD(finalStart) !== baseYMD || this.toYMD(finalEnd) !== baseYMD) {
          return { message: 'Thời gian bắt đầu/kết thúc phải cùng ngày với bản ghi.', statusCode: 400 };
        }
  
        if (finalStart.getTime() >= finalEnd.getTime()) {
          return { message: 'Thời gian bắt đầu phải nhỏ hơn kết thúc', statusCode: 400 };
        }
      }


      const updated = await this.workLogModel.findByIdAndUpdate(
        _id,
        { $set: patch },
        { new: true, runValidators: true, context: 'query', strict: true }
      ).lean();

      if (!updated) {
        return { message: 'Không tìm thấy giờ làm.', statusCode: 404, data: null };
      }

      return {
        message: 'Cập nhật giờ làm thành công.',
        statusCode: 200
      };
    } catch (error) {
      return {
        message: `Sửa giờ làm không thành công. Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }
  //#endregion
  
  async findOneById(_id: string): Promise<ResponseDto> {
    try {
      const workLog = await this.workLogModel
        .findOne({ _id: _id })
        .select('-user_id -dayKey -__v -createdAt -updatedAt');
      if (!workLog)
        return {
          message: 'Không tìm thấy việc làm.',
          statusCode: 400
        };
      
      return {
        message: 'Lấy thông tin công việc thành công.',
        statusCode: 200,
        data: workLog,
      };
    } catch (error) {
      return {
        message: `Lỗi: ${error?.message ?? error}`,
        statusCode: 500,
      };
    }
  }

  async remove(_id: string): Promise<ResponseDto> {
    try {
      const workLog = await this.workLogModel.deleteOne({ _id: _id });
      if (workLog.deletedCount > 0)
        return {
          message: 'Xoá công việc thành công.',
          statusCode: 200,
        };
      else
        return {
          message: 'Công việc đã bị xoá trước đó.',
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
