import { AutoMap } from '@automapper/classes';

export class AssetSummaryDTO {
  @AutoMap()
  short: string;
  @AutoMap()
  medium: string;
  @AutoMap()
  long: string;
}
