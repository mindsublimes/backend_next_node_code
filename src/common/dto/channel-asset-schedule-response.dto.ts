import { AssetScheduleDTO } from './asset-schedule.dto';

export class ChannelAssetScheduleResponseDTO {
  /**
   *  This is used to initialize the array with default value
   */
  constructor() {
    this.channelsAssetsSchedules.assetSchedules = [];
  }
  public channelsAssetsSchedules: {
    channel: {
      id: string;
      title: string;
      logo: string;
    };
    assetSchedules: AssetScheduleDTO[];
  };
}
  