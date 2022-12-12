import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import ResponseHelper from '@Helper/response-helper';
import {
  AssetCategory,
  AssetCategoryDocument,
} from '@Entities/asset-category.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AssetCategoryRepository } from '@Repository/asset-category.repository';
import ApiResponse from '@Helper/api-response';
import { AssetCategoryListResponseDTO } from '@DTO/asset-category-response-dto';

@Injectable()
export default class AssetCategoryService {
  /**
   * Service to fetch asset category list
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly assetCategoryRepository: AssetCategoryRepository,
  ) {}

  // TOOD: Comment
  /**
   *
   * @returns
   */
  async getAllAssetCategory(): Promise<
    ApiResponse<AssetCategoryListResponseDTO[]>
  > {
    let data = await this.assetCategoryRepository.getAll();
    let result = this.mapper.mapArray(
      data,
      AssetCategory,
      AssetCategoryListResponseDTO,
    );
    return ResponseHelper.CreateResponse<AssetCategoryListResponseDTO[]>(
      result,
      HttpStatus.OK,
    );
  }
}
