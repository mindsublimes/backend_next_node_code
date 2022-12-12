import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssetCategory, AssetCategoryDocument } from '@Entities/asset-category.entity';
import { BaseRepository } from './base.repository';


@Injectable()
export class AssetCategoryRepository extends BaseRepository<AssetCategoryDocument> {
  constructor(
    @InjectModel(AssetCategory.name)
    private model: Model<AssetCategory>,
  ) {
    super(model);
  }
  
  /**
   * This method will get all Asset Category List.
   * @returns this will return Asset Category List.
   */

   public async getAssetCategory():  Promise<AssetCategory[]> {
    let result = await this.getAll();
    return result;
  }
}