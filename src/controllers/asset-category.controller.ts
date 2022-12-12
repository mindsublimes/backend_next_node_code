import ApiResponse from '@Helper/api-response';
import AssetCategoryService from '@Services/asset-category.service';
import { AssetCategoryListResponseDTO } from '@DTO/asset-category-response-dto';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BaseDTO } from '@DTO/base.dto';

@Controller('assetcategory')
export class AssetCategoryController {
  constructor(private readonly assetCategoryService: AssetCategoryService) {}

  /**
   *
   * @returns contains all asset categories list
   */
  @Get('')
  async getAssetCategory() {
    let res = await this.assetCategoryService.getAllAssetCategory();
    return res;
  }
}
