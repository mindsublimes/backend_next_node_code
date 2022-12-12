import { Document, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';

export type AssetCategoryDocument = AssetCategory & Document;

@Schema()
export class AssetCategory extends Document {
  @Prop()
  @AutoMap()
  title: string;
  @Prop()
  @AutoMap()
  category: string;  
}

export const AssetCategorySchema = SchemaFactory.createForClass(AssetCategory);
