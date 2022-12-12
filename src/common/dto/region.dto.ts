import { AutoMap } from '@automapper/classes';

export class RegionDTO {
  @AutoMap()
  regionId: string;
  @AutoMap()
  regionName: string;
}
