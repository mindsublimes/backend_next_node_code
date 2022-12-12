import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
export type GlobalConfigurationDocument = GlobalConfiguration & Document;

@Schema()
export class GlobalConfiguration extends Document {
  @Prop()
  @AutoMap()
  isJobHasBeenRunningFirstTime: boolean;
  @Prop()
  @AutoMap()
  isPlatformDataExists: boolean;
  @Prop()
  @AutoMap()
  isChannelDataExists: boolean;
  @Prop()
  @AutoMap()
  isRegionDataExists: boolean;
}

export const GlobalConfigurationSchema =
  SchemaFactory.createForClass(GlobalConfiguration);
