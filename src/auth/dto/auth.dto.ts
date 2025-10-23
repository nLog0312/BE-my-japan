import { IsNotEmpty, IsOptional } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: 'Tài khoản không được để trống.' })
    user_name: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
    password: string;
}

export class AuthDto {
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
    is_active_email: boolean;
}
