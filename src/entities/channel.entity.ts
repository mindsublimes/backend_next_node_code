import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
import { ChannelCategoryDTO } from '@DTO/channel-category.dto';
import { PlatformDTO } from '@DTO/platform.dto';
export type ChannelDocument = Channel & Document;

@Schema()
export class Channel extends Document {
  @Prop()
  @AutoMap()
  public Id: string;
  @Prop()
  @AutoMap()
  public title: string;
  @Prop()
  @AutoMap()
  public logo: string;
  @Prop()
  @AutoMap(() => [ChannelCategoryDTO])
  public categories: ChannelCategoryDTO[] = [];
  @Prop()
  @AutoMap(() => [PlatformDTO])
  public platforms: PlatformDTO[] = [];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
