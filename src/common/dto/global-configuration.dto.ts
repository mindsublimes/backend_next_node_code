import { AutoMap } from '@automapper/classes';

export class GlobalConfigurationDTO {
  @AutoMap()
  isJobHasBeenRunningFirstTime: boolean;
  @AutoMap()
  isPlatformDataExists: boolean;
  @AutoMap()
  isChannelDataExists: boolean;
  @AutoMap()
  isRegionDataExists: boolean;
}
