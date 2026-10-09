import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true }) userId: Types.ObjectId;
  @Prop({ required: true, enum: ['expense', 'income'] }) type: string;
  @Prop({ required: true }) category: string;
  @Prop() subcategory?: string;
  @Prop({ required: true, min: 0.01 }) amount: number;
  @Prop({ required: true }) date: Date;
  @Prop({ default: '' }) description: string;
}
export type TransactionDocument = HydratedDocument<Transaction> & { createdAt: Date; updatedAt: Date };
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
