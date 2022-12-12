export default class Constants {
  public static readonly PRESS_ASSOCIATION_API_BASE_URL: string =
    'https://tv.api.pressassociation.io/v2/';
  public static readonly CHANNEL_SCHEDULE_URL =
    '/schedule?channelId=cId&start=sDate&end=eDate&aliases=true';

  public static readonly ERROR_MESSAGE_WHEN_NO_SCHEDULE_RESPONSE =
    'No schedule data found';

  public static readonly GENERIC_ERROR_INSERT_MESSAGE =
    'There is some error while inserting this collection!.';

  public static readonly TIME_ZONE = 'Europe/London';

  public static readonly UTC_STRING_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
}
