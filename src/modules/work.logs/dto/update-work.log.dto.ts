import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateWorkLogDto {
    @IsNotEmpty({ message: 'Id không được để trống.' })
    _id: string;
    @IsOptional()
    start_time?: string | Date;
    @IsOptional()
    end_time?: string | Date;
    @IsOptional()
    break_minutes?: number;
    @IsOptional()
    hourly_rate?: number;
    @IsOptional()
    regular_hours?: number;
    @IsOptional()
    is_overtime?: boolean;
    @IsOptional()
    overtime_hours?: number;
    @IsOptional()
    overtime_multiplier?: number;
    @IsOptional()
    note?: string;
}
