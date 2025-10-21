import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateWorkLogDto {
    @IsNotEmpty({ message: 'User id không được để trống.' })
    user_id: string;
    @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống.' })
    @IsDateString()
    start_time: string; 
    @IsNotEmpty({ message: 'Giờ kết thúc không được để trống.' })
    @IsDateString()
    end_time: string;
    @IsNotEmpty({ message: 'Thời gian nghỉ không được để trống.' })
    break_minutes: number;
    @IsNotEmpty({ message: 'Tiền theo giờ không được để trống.' })
    hourly_rate: number;
    @IsNotEmpty({ message: 'Số giờ thường không được để trống.' })
    regular_hours: number;
    @IsOptional()
    is_overtime?: boolean = false;
    @IsOptional()
    overtime_hours?: number = 0;
    @IsOptional()
    overtime_multiplier?: number = 1.25;
    @IsOptional()
    note?: string;
}
