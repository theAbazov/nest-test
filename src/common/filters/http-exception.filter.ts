import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exceptionResponse as string;
      }
    } else {
      // Необработанная ошибка
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Внутренняя ошибка сервера';
      
      // Логируем подробности ошибки для отладки
      this.logger.error(
        `Необработанная ошибка: ${exception}`,
        (exception as Error)?.stack,
        `${request.method} ${request.url}`,
      );
    }

    const timestamp = new Date().toISOString();
    const path = request.url;

    const errorResponse = {
      success: false,
      data: null,
      error: {
        statusCode: status,
        message: message,
        timestamp: timestamp,
        path: path,
      },
    };

    // Логируем HTTP исключения
    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} Error: ${JSON.stringify(message)}`,
        (exception as Error)?.stack,
        `${request.method} ${request.url}`,
      );
    } else {
      this.logger.warn(
        `HTTP ${status} Error: ${JSON.stringify(message)}`,
        `${request.method} ${request.url}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
