import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import ApiResponse from '@Helper/api-response';

@Injectable()
export default class ResponseHandlerInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        let response = context.switchToHttp().getResponse();
        if (!data) {
          response.status(HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          response.status(data.statusCode);
        }
        return data;
      }),
    );
  }
}
