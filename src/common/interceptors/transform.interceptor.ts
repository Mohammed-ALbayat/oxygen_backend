import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// تحديد شكل الريسبونس الموحد
export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: statusCode < 400, // True إذا كان الكود 200 أو 201
        statusCode: statusCode,
        // إذا كنت ترجع كائن يحتوي على رسالة، استخدمها، وإلا ضع رسالة افتراضية
        message: data?.message || 'Request processed successfully',
        // إذا كان هناك حقل data داخل البيانات المرجعة نأخذه، وإلا نأخذ الكائن كاملاً
        data: data?.data !== undefined ? data.data : data,
      })),
    );
  }
}