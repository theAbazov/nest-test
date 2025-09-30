import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../../common/guards/ws-jwt-auth.guard';
import { WsExceptionsFilter } from './ws-exceptions.filter';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      email: string;
      username: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Настройте под ваш фронтенд
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@UseFilters(new WsExceptionsFilter())
export class TodoWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TodoWebSocketGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Аутентификация проверяется в guard, но здесь можем добавить логику подключения
      this.logger.log(`Client attempting to connect: ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    try {
      const user = client.data?.user;
      if (user) {
        // Удаляем пользователя из списка подключенных
        this.connectedUsers.delete(user.id);
        this.logger.log(`User ${user.username} (${user.id}) disconnected`);
      }
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message}`);
    }
  }

  @SubscribeMessage('join')
  @UseGuards(WsJwtAuthGuard)
  async handleJoin(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const user = client.data.user;
      
      // Сохраняем связь пользователь -> socket
      this.connectedUsers.set(user.id, client.id);
      
      this.logger.log(`User ${user.username} (${user.id}) joined`);
      
      // Подтверждаем подключение
      client.emit('joined', {
        message: 'Successfully connected to real-time updates',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });

      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Join error: ${error.message}`);
      client.emit('error', { message: 'Failed to join' });
      return { status: 'error', message: error.message };
    }
  }

  // Методы для отправки событий пользователям
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      this.logger.log(`Emitted ${event} to user ${userId}`);
    }
  }

  emitTodoCreated(userId: string, todo: any) {
    this.emitToUser(userId, 'todo:created', todo);
  }

  emitTodoUpdated(userId: string, todo: any) {
    this.emitToUser(userId, 'todo:updated', todo);
  }

  emitTodoDeleted(userId: string, todoId: string) {
    this.emitToUser(userId, 'todo:deleted', { id: todoId });
  }

  emitTodoCompleted(userId: string, todo: any) {
    this.emitToUser(userId, 'todo:completed', todo);
  }

  // Получить количество подключенных пользователей
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Проверить, подключен ли пользователь
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
