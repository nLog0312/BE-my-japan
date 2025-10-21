import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateTodoDto {
    @IsNotEmpty({ message: 'Id không được để trống.' })
    _id: string;
    @IsOptional()
    title: string;
    @IsOptional()
    description: string;
    @IsOptional()
    due_at: string | Date;
    @IsOptional()
    repeat_rule?: number; // 0: day, 1: month. 2: year
}
