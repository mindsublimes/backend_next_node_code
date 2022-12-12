import { AutoMap } from '@automapper/classes';
import { ChannelCategoryDTO } from './channel-category.dto';
import { PlatformDTO } from './platform.dto';
import { RegionDTO } from './region.dto';

export class ChannelDTO {
  @AutoMap()
  Id: string;
  @AutoMap()
  title: string;
  @AutoMap()
  logo: string;
  @AutoMap(() => ChannelCategoryDTO)
  categories: ChannelCategoryDTO[] = [];
  @AutoMap(() => PlatformDTO)
  platforms: PlatformDTO[] = [];
}
