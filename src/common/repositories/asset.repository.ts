import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Asset, AssetDocument } from '@Entities/asset.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class AssetRepository extends BaseRepository<AssetDocument> {
  constructor(
    @InjectModel(Asset.name)
    private model: Model<Asset>,
  ) {
    super(model);
  }

  public CreateAssets() {
    return 'Schedule';
  }
}
