import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TodosModule } from './modules/todos/todos.module';
import { FilesModule } from './modules/files/files.module';
import { WebSocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, TodosModule, FilesModule, WebSocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
