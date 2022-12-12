import { Document, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
export type AssetDocument = Asset & Document;

@Schema()
export class Asset extends Document {
  @AutoMap()
  @Prop()
  public assetId: number;
  @AutoMap()
  @Prop()
  public assetTitle: string;
}

export const UserSchema = SchemaFactory.createForClass(Asset);
