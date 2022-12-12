import { UserRepository } from '@Repository/user.repository';
import { Module } from '@nestjs/common';
import { UserService } from '@Services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@Entities/user.entity';
import { UserProfile } from '@Profiles/user.profile';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserProfile, UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
