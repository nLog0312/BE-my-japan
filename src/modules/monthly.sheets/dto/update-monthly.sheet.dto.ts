import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateMonthlySheetDto {
    @IsNotEmpty({ message: 'Id không được để trống.' })
    _id: string;
    @IsOptional()
    entry_date?: string | Date;
    @IsOptional()
    kind?: boolean;
    @IsOptional()
    amount?: number;
    @IsOptional()
    name?: string;
    @IsOptional()
    note?: string;
}
