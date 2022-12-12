import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { FilterQuery } from 'mongoose';
import { Platform, PlatformDocument } from '@Entities/platform.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class PlatformRepository extends BaseRepository<PlatformDocument> {
  constructor(
    @InjectModel(Platform.name)
    private model: Model<Platform>,
  ) {
    super(model);
  }
  
  /**
   * This method will get all platforms
   * @returns this will return Platform List.
   */
   public async getPlatform():  Promise<Platform[]> {
    let result = await this.getAll();
    return result;
  }
}
