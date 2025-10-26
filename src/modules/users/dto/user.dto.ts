import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Id không được để trống.' })
    _id: string;
    @IsNotEmpty({ message: 'Pasword không được để trống.' })
    old_password: string;
    @IsNotEmpty({ message: 'Pasword không được để trống.' })
    new_password: string;
}

export class SetupWorklogDto {
    @Expose()
    @IsOptional()
    auto: boolean;

    @Expose()
    @IsOptional()
    start_time: string;

    @Expose()
    @IsOptional()
    end_time: string;

    @Expose()
    @IsOptional()
    hourly_rate: number;

    @Expose()
    @IsOptional()
    overtime_multiplier: number;
}

export class FindUserDto {
    @IsOptional()
    @Expose()
    name: string;
    @IsOptional()
    @Expose()
    email: string;
    @IsOptional()
    @Expose()
    is_active_email: boolean;
    @IsOptional()
    @IsOptional()
    @Expose()
    locale: string;

    @IsOptional()
    @Expose()
    @Type(() => SetupWorklogDto)
    setup_worklog: SetupWorklogDto;
}

// export class FindSetupWorklogDto {
//     @IsOptional()
//     @Expose()
//     @Type(() => SetupWorklogDto)
//     setup_worklog: SetupWorklogDto;
// }
