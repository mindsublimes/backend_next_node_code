import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@Repository/base.repository';
import { User, UserDocument } from '@Entities/user.entity';

//@Injectable()
// export class MongoDataServices implements OnApplicationBootstrap {
//   users: BaseRepository<User>;

//   constructor(
//     @InjectModel(User.name)
//     private userRepository: Model<UserDocument>,
//   ) {}

//   onApplicationBootstrap() {
//     this.users = new BaseRepository(this.userRepository);
//   }
// }
