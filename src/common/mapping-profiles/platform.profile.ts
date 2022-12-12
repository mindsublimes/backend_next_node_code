import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Platform } from '@Entities/platform.entity';
import { BaseAPIResponse } from '@DTO/press-association-api-responses/base.api.response';
import { PlatformDTO } from '@DTO/platform.dto';

@Injectable()
export class PlatformProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, PlatformDTO, Platform),
        createMap(mapper, Platform, PlatformDTO),
        createMap(
          mapper,
          BaseAPIResponse,
          PlatformDTO,
          forMember(
            (p) => p.platformId,
            mapFrom((b) => b.id),
          ),
          forMember(
            (p) => p.platformName,
            mapFrom((b) => b.title),
          ),
        ),
        createMap(
          mapper,
          PlatformDTO,
          BaseAPIResponse,
          forMember(
            (b) => b.id,
            mapFrom((p) => p.platformId),
          ),
          forMember(
            (b) => b.title,
            mapFrom((p) => p.platformName),
          ),
        );
    };
  }
}
