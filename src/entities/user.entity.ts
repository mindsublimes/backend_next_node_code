import { Document, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoMap } from '@automapper/classes';
export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @AutoMap()
  @Prop()
  email: string;
  @AutoMap()
  @Prop()
  region: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
