import { AutoMap } from '@automapper/classes';
import { ChannelCategoryDTO } from './channel-category.dto';

export class ChannelResponseDTO {
  @AutoMap()
  public channelId: string;
  @AutoMap()
  public logo: string;
  @AutoMap(() => [ChannelCategoryDTO])
  public categories: ChannelCategoryDTO[];
  @AutoMap()
  public channelTitle: string;
}
