import { Document, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
import { RegionDTO } from '@DTO/region.dto';
export type PlatformDocument = Platform & Document;

@Schema()
export class Platform extends Document {
  @Prop()
  @AutoMap()
  platformId: string;
  @Prop()
  @AutoMap()
  platformName: string;
  @Prop()
  @AutoMap(() => [RegionDTO])
  regions: RegionDTO[] = [];
}

export const PlatformSchema = SchemaFactory.createForClass(Platform);
