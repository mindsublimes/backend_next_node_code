import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { User } from '@Entities/user.entity';
import { UserDTO } from '@DTO/user-response.dto';

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        User,
        UserDTO,
        forMember(
          (s) => s.id,
          mapFrom((d) => d._id),
        ),
      ),
        createMap(mapper, UserDTO, User);
    };
  }
}
