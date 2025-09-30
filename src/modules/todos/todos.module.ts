import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { Todo } from './todo.entity';
import { User } from '../users/user.entity';
import { FilesModule } from '../files/files.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Todo, User]),
    forwardRef(() => FilesModule),
    forwardRef(() => WebSocketModule),
  ],
  controllers: [TodosController],
  providers: [TodosService],
  exports: [TodosService],
})
export class TodosModule {}
