import ApiResponse from './api-response';
import Feedback from './feedback';
export default class ResponseHelper<T> {
  public static CreateResponse<T>(
    data?: T,
    statusCode?: number,
    message?: string,
    feedbacks?: Feedback[],
  ) {
    return new ApiResponse<T>(message, data, statusCode, feedbacks);
  }
}
