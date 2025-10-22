import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateUserDto {
    @IsNotEmpty({ message: 'Id không được để trống.' })
    _id: string;
    @IsOptional()
    name: string;
    @IsOptional()
    email: string;
    @IsOptional()
    currency: string;
    @IsOptional()
    locale: string;
    @IsOptional()
    setup_worklog?: {
        auto?: boolean;
        start_time?: string;
        end_time?: string;
        hourly_rate?: number;
    };
}