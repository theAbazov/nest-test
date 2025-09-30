import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    
    this.logger.error('WebSocket Exception:', exception);

    // Отправляем клиенту информацию об ошибке
    client.emit('error', {
      message: exception instanceof Error ? exception.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    super.catch(exception, host);
  }
}
