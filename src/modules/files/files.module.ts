import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from './file.entity';
import { Todo } from '../todos/todo.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([File, Todo, User])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
