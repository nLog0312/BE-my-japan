import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateMonthlySheetDto {
    @IsNotEmpty({ message: 'User Id không được để trống.' })
    user_id: string;
    @IsNotEmpty({ message: 'Ngày phát sinh không được để trống.' })
    entry_date: string | Date; 
    @IsNotEmpty({ message: 'Kiểu không được để trống.' })
    kind: boolean = false;
    @IsNotEmpty({ message: 'Số tiền không được để trống.' })
    amount: number;
    @IsNotEmpty({ message: 'Tên khoản không được để trống.' })
    name: string;
    @IsOptional()
    note?: string;
}
