import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, enum: ['expense', 'income'] }) type: string;
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ type: [String], default: [] }) subcategories: string[];
}
export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ type: 1, name: 1 }, { unique: true });
