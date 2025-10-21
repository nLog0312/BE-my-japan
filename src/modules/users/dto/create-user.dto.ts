import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: 'Tài khoản không được để trống.' })
    user_name: string;
    @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
    password: string;
    @IsOptional()
    email: string;
    @IsOptional()
    name: string;
    @IsNotEmpty({ message: 'Loại tiền tệ không được để trống.' })
    currency: string;
    @IsOptional()
    locale: string;
}
