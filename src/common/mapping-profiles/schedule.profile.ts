import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';
import { Schedule } from '@Entities/schedule.entity';

@Injectable()
export class ScheduleProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, AssetScheduleDTO, Schedule),
        createMap(mapper, Schedule, AssetScheduleDTO);
    };
  }
}
