import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { ProgramRatingRequestDTO } from '@DTO/program-rating-request.dto';
import { Rating } from '@Entities/rating.entity';
@Injectable()
export class RatingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ProgramRatingRequestDTO, Rating),
        createMap(mapper, Rating, ProgramRatingRequestDTO);
    };
  }
}
