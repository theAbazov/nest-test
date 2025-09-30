import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { Todo } from './todo.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([Todo, User])],
  controllers: [TodosController],
  providers: [TodosService],
  exports: [TodosService],
})
export class TodosModule {}
