import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
import { ChannelListDTO } from '@DTO/channelList.dto';

export type MyChannelDocument = MyChannel & Document;
@Schema()
export class MyChannel extends Document {
    @Prop()
    @AutoMap()
    public userId: string;
    @Prop()
    @AutoMap(() => [ChannelListDTO])
    public channelList: ChannelListDTO;
}

export const MyChannelSchema = SchemaFactory.createForClass(MyChannel);
