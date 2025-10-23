import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop()
    user_name: string;
    @Prop()
    email?: string;
    @Prop()
    password_hash: string;
    @Prop()
    name: string;
    @Prop()
    locale: string;
    @Prop({ default: false })
    is_active_email?: boolean;
    @Prop()
    code_id?: string;
    @Prop()
    code_expired?: string;
    @Prop({
        type: {
            auto: { type: Boolean },
            start_time: { type: String },
            end_time: { type: String },
            hourly_rate: { type: Number },
        },
        default: {},
    })
    setup_worklog?: {
        auto?: boolean;
        start_time?: string;
        end_time?: string;
        hourly_rate?: number;
    };
}

export const UserSchema = SchemaFactory.createForClass(User);