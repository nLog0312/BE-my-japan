import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, HydratedDocument } from 'mongoose';

export type WorkLogDocument = HydratedDocument<WorkLog>;

@Schema({ timestamps: true })
export class WorkLog {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    user_id: mongoose.Schema.Types.ObjectId;
    @Prop({ type: Date })
    start_time: Date;
    @Prop({ type: Date })
    end_time: Date;
    @Prop({ default: 60 })
    break_minutes: number;
    @Prop({ default: 0 })
    hourly_rate: number;
    @Prop({ default: 8 })
    regular_hours: number;
    @Prop({ default: 0 })
    overtime_hours: number;
    @Prop({ default: false })
    is_overtime: mongoose.Schema.Types.Boolean;
    @Prop({ default: 1.25 })
    overtime_multiplier: number;
    @Prop()
    note: string;

    @Prop({ type: String, required: true })
    dayKey: string;
}

export const WorkLogSchema = SchemaFactory.createForClass(WorkLog);

WorkLogSchema.index({ user_id: 1, dayKey: 1 }, { unique: true });