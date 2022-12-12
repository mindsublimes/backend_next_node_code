import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { MyChannel } from '@Entities/my-channels.entity';
import { CreateMyChannelListDTO } from '@DTO/create-my-channel-list.dto';

@Injectable()
export class MyChannelProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(mapper, CreateMyChannelListDTO, MyChannel),
                createMap(mapper, MyChannel, CreateMyChannelListDTO);
        };
    }
}
