import { AutoMap } from '@automapper/classes';
import { RegionDTO } from './region.dto';

export class PlatformDTO {
  @AutoMap()
  platformId: string;
  @AutoMap()
  platformName: string;
  @AutoMap(() => RegionDTO)
  regions?: RegionDTO[] = [];
}
