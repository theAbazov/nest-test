import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      map((data) => {
        // Если данные уже в формате ApiResponse, возвращаем как есть
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Определяем сообщение на основе HTTP метода
        let message: string;
        switch (method) {
          case 'POST':
            message = 'Ресурс успешно создан';
            break;
          case 'PUT':
          case 'PATCH':
            message = 'Ресурс успешно обновлен';
            break;
          case 'DELETE':
            message = 'Ресурс успешно удален';
            break;
          default:
            message = 'Запрос выполнен успешно';
        }

        // Если это файловый ответ (StreamableFile), пропускаем трансформацию
        if (data && data.constructor.name === 'StreamableFile') {
          return data;
        }

        // Форматируем стандартный ответ
        return {
          success: true,
          data: data,
          message: message,
        };
      }),
    );
  }
}
