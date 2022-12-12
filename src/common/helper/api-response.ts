import { HttpStatus } from '@nestjs/common';
import Feedback from './feedback';

export default class ApiResponse<T> {
  constructor(
    message: string,
    response: T,
    statusCode: number,
    feedbacks: Feedback[],
  ) {
    this.message = message;
    this.data = response;
    if (statusCode >= HttpStatus.BAD_REQUEST) {
      this.success = false;
    } else {
      this.success = true;
    }
    this.statusCode = statusCode;
    this.feedbacks = feedbacks;
  }

  public statusCode: number = HttpStatus.OK;
  public data: T;
  public message: string = '';
  public feedbacks: Feedback[];
  public success: boolean;
}
