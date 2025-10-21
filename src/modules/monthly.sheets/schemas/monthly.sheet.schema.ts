import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MonthlySheetDocument = HydratedDocument<MonthlySheet>;

@Schema({ timestamps: true })
export class MonthlySheet {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    user_id: mongoose.Schema.Types.ObjectId;
    @Prop({ type: Date })
    entry_date: Date;
    @Prop()
    kind: boolean = false; // true = 'income' hoặc false = 'expense'
    @Prop()
    amount: number;
    @Prop()
    name: string;
    @Prop()
    note: string;
}

export const MonthlySheetSchema = SchemaFactory.createForClass(MonthlySheet);