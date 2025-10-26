import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";


export class SetupWorklogDto {
    @IsOptional()
    auto: boolean;

    @IsOptional()
    start_time: string;

    @IsOptional()
    end_time: string;

    @IsOptional()
    hourly_rate: number;

    @IsOptional()
    overtime_multiplier: number;
}

export class UpdateUserDto {
    @IsNotEmpty({ message: 'Id không được để trống.' })
    _id: string;
    @IsOptional()
    name: string;
    @IsOptional()
    email: string;
    @IsOptional()
    locale: string;
    @IsOptional()
    @Type(() => SetupWorklogDto)
    setup_worklog?: SetupWorklogDto;
}