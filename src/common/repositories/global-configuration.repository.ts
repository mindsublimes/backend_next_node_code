import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import {
  GlobalConfiguration,
  GlobalConfigurationDocument,
} from '@Entities/global-configuration.entity';

@Injectable()
export class GlobalConfigurationRepository extends BaseRepository<GlobalConfigurationDocument> {
  constructor(
    @InjectModel(GlobalConfiguration.name)
    private model: Model<GlobalConfiguration>,
  ) {
    super(model);
  }
}
