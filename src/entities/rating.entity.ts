import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
export type RatingDocument = Rating & Document;

@Schema()
export class Rating extends Document {
  @Prop()
  @AutoMap()
  userId: string;
  @Prop()
  @AutoMap()
  assetId: string;
  @Prop()
  @AutoMap()
  rating: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
