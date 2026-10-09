import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ unique: true, sparse: true, lowercase: true, trim: true }) email?: string;
  @Prop({ unique: true, sparse: true, trim: true }) phone?: string;
  @Prop({ required: true }) passwordHash: string;
  @Prop({ default: 'INR' }) currency: string;
}
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
