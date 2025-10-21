import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({ timestamps: true })
export class Todo {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    user_id: mongoose.Schema.Types.ObjectId;
    @Prop()
    title: string;
    @Prop()
    description: string;
    @Prop()
    due_at: mongoose.Schema.Types.Date;
    @Prop({ default: 'open' })
    status: string;
    @Prop()
    repeat_rule: number; // 0: day, 1: month. 2: year
}

export const TodoSchema = SchemaFactory.createForClass(Todo);