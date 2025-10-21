import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Id không được để trống.' })
    _id: string;
    @IsNotEmpty({ message: 'Pasword không được để trống.' })
    old_password: string;
    @IsNotEmpty({ message: 'Pasword không được để trống.' })
    new_password: string;
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
    @Expose()
    currency: string;
    @IsOptional()
    @Expose()
    locale: string;
}
