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
}