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
    currency: string;
    @Prop()
    locale: string;
    @Prop({ default: false })
    is_active_email?: boolean;
    @Prop()
    code_id?: string;
    @Prop()
    code_expired?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);