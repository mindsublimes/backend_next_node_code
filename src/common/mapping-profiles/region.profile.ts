import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Region } from '@Entities/region.entity';
import { BaseAPIResponse } from '@DTO/press-association-api-responses/base.api.response';
import { RegionDTO } from '@DTO/region.dto';
@Injectable()
export class RegionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, RegionDTO, Region),
        createMap(mapper, Region, RegionDTO),
        createMap(
          mapper,
          BaseAPIResponse,
          RegionDTO,
          forMember(
            (p) => p.regionId,
            mapFrom((b) => b.id),
          ),
          forMember(
            (p) => p.regionName,
            mapFrom((b) => b.title),
          ),
        ),
        createMap(
          mapper,
          RegionDTO,
          BaseAPIResponse,
          forMember(
            (b) => b.id,
            mapFrom((p) => p.regionId),
          ),
          forMember(
            (b) => b.title,
            mapFrom((p) => p.regionName),
          ),
        );
    };
  }
}
