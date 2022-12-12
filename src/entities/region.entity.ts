import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
export type RegionDocument = Region & Document;

@Schema()
export class Region extends Document {
  @Prop()
  @AutoMap()
  regionId: string;
  @Prop()
  @AutoMap()
  regionName: string;
}

export const RegionSchema = SchemaFactory.createForClass(Region);
