import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { AssetCalendarResponseDTO } from '@DTO/asset-calendar-response.dto';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';

@Injectable()
export class AssetProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, AssetCalendarResponseDTO, AssetScheduleDTO),
        createMap(mapper, AssetScheduleDTO, AssetCalendarResponseDTO);
    };
  }
}
