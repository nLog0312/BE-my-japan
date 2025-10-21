import { IsInt, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class MonthSheetQueryDto {
    @IsNotEmpty({ message: 'User Id không được để trống.' })
    user_id: string;
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/,{ message: 'day cần dạng YYYY-MM-DD.' })
    day?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}$/,{ message: 'month cần dạng YYYY-MM.' })
    month?: string;

    @IsOptional()
    @Matches(/^\d{4}$/,{ message: 'year cần dạng YYYY.' })
    year?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/,{ message: 'from cần dạng YYYY-MM-DD.' })
    from?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/,{ message: 'to cần dạng YYYY-MM-DD.' })
    to?: string;

    @IsOptional() @Type(() => Number) @IsInt()
    current?: number;

    @IsOptional() @Type(() => Number) @IsInt()
    pageSize?: number;
}