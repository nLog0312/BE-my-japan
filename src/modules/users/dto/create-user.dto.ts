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
    @IsOptional()
    locale: string;
}
