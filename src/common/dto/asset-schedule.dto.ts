import { AutoMap } from '@automapper/classes';
import { AssetCategoryDTO } from './asset-category.dto';
import { AssetSummaryDTO } from './asset-summary.dto';

export class AssetScheduleDTO {
  @AutoMap()
  public channelId: string;
  @AutoMap()
  public assetId: string;
  @AutoMap()
  public scheduleId: string;
  @AutoMap()
  public title: string;
  @AutoMap()
  public startDate: Date;
  @AutoMap()
  public endDate: Date;
  @AutoMap()
  duration: number;
  @AutoMap()
  public image: string;
  @AutoMap(() => [AssetCategoryDTO])
  public category: AssetCategoryDTO[] = [];
  @AutoMap(() => AssetSummaryDTO)
  public summary: AssetSummaryDTO;
  @AutoMap()
  public channelTitle: string;
  @AutoMap()
  public channelLogo: string;
}
