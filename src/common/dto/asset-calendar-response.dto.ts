import { AssetScheduleDTO } from './asset-schedule.dto';

export class AssetCalendarResponseDTO extends AssetScheduleDTO {
  public programStartTime: string;

  public programEndTime: string;

  public programStartDate: string;

  public calendarStartDate: string;

  public calendarEndDate: string;

  public calendarStartTime: string;

  public calendarEndTime: string;
}
