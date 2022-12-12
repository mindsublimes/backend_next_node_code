import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { ChannelDTO } from '@DTO/channel.dto';
import { Channel } from '@Entities/channel.entity';

@Injectable()
export class ChannelProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ChannelDTO, Channel),
        createMap(mapper, Channel, ChannelDTO);
    };
  }
}
