import { IsInt, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MonthSheetQueryDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'User Id không được để trống.' })
    user_id: string;
    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/,{ message: 'day cần dạng YYYY-MM-DD.' })
    day?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}$/,{ message: 'month cần dạng YYYY-MM.' })
    month?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^\d{4}$/,{ message: 'year cần dạng YYYY.' })
    year?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/,{ message: 'from cần dạng YYYY-MM-DD.' })
    from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/,{ message: 'to cần dạng YYYY-MM-DD.' })
    to?: string;

    @ApiPropertyOptional()
    @IsOptional() @Type(() => Number) @IsInt()
    current?: number;

    @ApiPropertyOptional()
    @IsOptional() @Type(() => Number) @IsInt()
    pageSize?: number;
}