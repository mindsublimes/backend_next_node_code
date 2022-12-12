import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { GlobalConfigurationDTO } from '@DTO/global-configuration.dto';
import { GlobalConfiguration } from '@Entities/global-configuration.entity';
@Injectable()
export class GlobalConfigurationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, GlobalConfigurationDTO, GlobalConfiguration),
        createMap(mapper, GlobalConfiguration, GlobalConfigurationDTO);
    };
  }
}
