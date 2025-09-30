import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      
      // Получаем токен из handshake auth или query
      const token = this.extractTokenFromClient(client);
      
      if (!token) {
        return false;
      }

      // Верифицируем JWT токен
      const payload = this.jwtService.verify(token);
      
      // Проверяем существование пользователя
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        return false;
      }

      // Сохраняем пользователя в socket для дальнейшего использования
      client.data.user = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      return true;
    } catch (error) {
      return false;
    }
  }

  private extractTokenFromClient(client: Socket): string | null {
    // Проверяем токен в handshake.auth.token
    const authToken = client.handshake.auth?.token;
    if (authToken) {
      return authToken.replace('Bearer ', '');
    }

    // Проверяем токен в query параметрах  
    const queryToken = client.handshake.query?.token as string;
    if (queryToken) {
      return queryToken.replace('Bearer ', '');
    }

    // Проверяем токен в headers
    const authorization = client.handshake.headers?.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.substring(7);
    }

    return null;
  }
}
