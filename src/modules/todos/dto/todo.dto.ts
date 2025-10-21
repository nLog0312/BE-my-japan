import { IsInt, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class TodoQueryDto {
    @IsNotEmpty({ message: 'User Id không được để trống.' })
    user_id: string;
    @IsOptional()
    title?: string;

    @IsOptional() @Type(() => Number) @IsInt()
    current?: number;

    @IsOptional() @Type(() => Number) @IsInt()
    pageSize?: number;
}