import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateTodoDto {
    @IsNotEmpty({ message: 'User Id không được để trống.' })
    user_id: string;
    @IsNotEmpty({ message: 'Tiêu đề không được để trống.' })
    title: string;
    @IsOptional()
    description: string;
    @IsNotEmpty({ message: 'Thời gian hết hạn không được để trống.' })
    due_at: string | Date;
    @IsOptional()
    repeat_rule?: number;
}
