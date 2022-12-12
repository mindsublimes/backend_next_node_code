import Constants from '@Helper/constants';
import moment from 'moment-timezone';

export class CommonFunctions {
  /**
   * This method will check first occurance of data against the filter and returns boolean. And if empty
   * data is passed then it will return false by default
   * @param data it's an array of specific type.
   * @param filterExpr filter criteria in which data will be validated against it.
   */
  public static IfExists(data: any[], filterExpr: any): boolean {
    if (data) {
      return data.some(filterExpr);
    }
    return false;
  }

  public static GetDate(date: any) {
    return moment(date).tz(Constants.TIME_ZONE);
  }
}
