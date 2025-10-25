import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response wrapper interface
 */
export interface Response<T> {
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Global response interceptor for consistent API responses
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        data,
        message: this.getSuccessMessage(statusCode),
        statusCode,
        timestamp: new Date().toISOString(),
      })),
    );
  }

  private getSuccessMessage(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'Success';
      case 201:
        return 'Created successfully';
      case 204:
        return 'No content';
      default:
        return 'Success';
    }
  }
}

