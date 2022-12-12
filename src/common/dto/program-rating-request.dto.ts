import { AutoMap } from '@automapper/classes';

export class ProgramRatingRequestDTO {
  @AutoMap()
  rating: number;
  @AutoMap()
  assetId: number;
  @AutoMap()
  userId: string;
}
