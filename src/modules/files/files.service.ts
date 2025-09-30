import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TodoNotFoundException } from '../../common/exceptions/todo-not-found.exception';
import { FileNotFoundException } from '../../common/exceptions/file-not-found.exception';
import { InjectModel } from '@nestjs/sequelize';
import { File } from './file.entity';
import { Todo } from '../todos/todo.entity';
import { User } from '../users/user.entity';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File)
    private fileModel: typeof File,
    @InjectModel(Todo)
    private todoModel: typeof Todo,
  ) {}

  async saveFile(
    fileData: Express.Multer.File,
    todoId: string,
    user: JwtPayload,
  ): Promise<File> {
    // Проверяем что todo принадлежит пользователю
    const todo = await this.todoModel.findOne({
      where: { id: todoId, userId: user.id },
    });

    if (!todo) {
      throw new NotFoundException('Todo не найден или не принадлежит вам');
    }

    const file = await this.fileModel.create({
      filename: fileData.filename,
      originalName: fileData.originalname,
      mimetype: fileData.mimetype,
      size: fileData.size,
      path: fileData.path,
      todoId: todoId,
      userId: user.id,
    } as any);

    return file;
  }

  async findOne(id: string, user: JwtPayload): Promise<File> {
    const file = await this.fileModel.findOne({
      where: { id, userId: user.id },
      include: [
        {
          model: Todo,
          attributes: ['id', 'title'],
        },
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    if (!file) {
      throw new FileNotFoundException(id);
    }

    return file;
  }

  async findByTodo(todoId: string, user: JwtPayload): Promise<File[]> {
    // Проверяем что todo принадлежит пользователю
    const todo = await this.todoModel.findOne({
      where: { id: todoId, userId: user.id },
    });

    if (!todo) {
      throw new NotFoundException('Todo не найден или не принадлежит вам');
    }

    return this.fileModel.findAll({
      where: { todoId, userId: user.id },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async delete(id: string, user: JwtPayload): Promise<void> {
    const file = await this.findOne(id, user);
    
    // Удаляем физический файл с диска
    try {
      const fullPath = join(process.cwd(), file.path);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Ошибка при удалении файла с диска:', error);
      // Продолжаем выполнение, чтобы удалить запись из БД
    }

    await file.destroy();
  }

  async deleteFilesByTodo(todoId: string): Promise<void> {
    const files = await this.fileModel.findAll({
      where: { todoId },
    });

    for (const file of files) {
      try {
        const fullPath = join(process.cwd(), file.path);
        if (existsSync(fullPath)) {
          unlinkSync(fullPath);
        }
      } catch (error) {
        console.error(`Ошибка при удалении файла ${file.filename}:`, error);
      }
    }

    await this.fileModel.destroy({
      where: { todoId },
    });
  }

  async validateFileAccess(fileId: string, userId: string): Promise<boolean> {
    const file = await this.fileModel.findOne({
      where: { id: fileId, userId },
    });

    return !!file;
  }
}
