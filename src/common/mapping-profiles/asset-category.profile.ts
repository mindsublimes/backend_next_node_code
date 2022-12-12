import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { AssetCategoryListResponseDTO } from '@DTO/asset-category-response-dto';
import { AssetCategory } from '@Entities/asset-category.entity';

@Injectable()
export class AssetCategoryProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, AssetCategoryListResponseDTO, AssetCategory),
        createMap(mapper, AssetCategory, AssetCategoryListResponseDTO);
    };
  }
}
