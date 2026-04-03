import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const hasMessage =
          data && typeof data === 'object' && 'message' in data;
        const hasData = data !== null && data !== undefined && !hasMessage;

        const response: Record<string, any> = {
          success: true,
          message: hasMessage ? data.message : 'Request successful',
        };

        if (hasData) {
          response.data = data;
        }

        return response;
      }),
    );
  }
}
