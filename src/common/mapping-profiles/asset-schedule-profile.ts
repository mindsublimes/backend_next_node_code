import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, ignore, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { AssetCalendarResponseDTO } from '@DTO/asset-calendar-response.dto';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';

@Injectable()
export class AssetScheduleProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        AssetScheduleDTO,
        AssetCalendarResponseDTO,
        forMember((s) => s.category, ignore()),
        forMember((s) => s.assetId, ignore()),
        forMember((s) => s.channelId, ignore()),
        forMember((s) => s.scheduleId, ignore()),
      ),
        createMap(
          mapper,
          AssetCalendarResponseDTO,
          AssetScheduleDTO,
          forMember((s) => s.category, ignore()),
          forMember((s) => s.assetId, ignore()),
          forMember((s) => s.channelId, ignore()),
          forMember((s) => s.scheduleId, ignore()),
        );
    };
  }
}
