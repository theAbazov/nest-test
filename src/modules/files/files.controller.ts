import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  StreamableFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { multerConfig } from '../../config/multer.config';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import type { File } from './file.entity';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('files/upload/:todoId')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ 
    summary: 'Загрузить файл к задаче',
    description: 'Загружает файл и привязывает его к указанной задаче. Поддерживаются изображения и PDF файлы до 5MB'
  })
  @ApiParam({ name: 'todoId', description: 'ID задачи', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл для загрузки (изображения или PDF, максимум 5MB)'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Файл успешно загружен',
    schema: {
      example: {
        success: true,
        data: {
          id: "file-uuid",
          filename: "unique-filename.jpg",
          originalName: "my-file.jpg", 
          mimetype: "image/jpeg",
          size: 1024000,
          path: "uploads/unique-filename.jpg"
        }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Файл не загружен, неподдерживаемый тип или превышен размер',
    schema: {
      example: {
        success: false,
        error: {
          message: "Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WebP) и PDF файлы."
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('todoId', ParseUUIDPipe) todoId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<File> {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    return this.filesService.saveFile(file, todoId, user);
  }

  @Get('files/:id')
  @ApiOperation({ 
    summary: 'Скачать файл',
    description: 'Скачивает файл по его ID. Файл должен принадлежать текущему пользователю'
  })
  @ApiParam({ name: 'id', description: 'ID файла', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Файл успешно найден и готов к скачиванию',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Файл не найден или не найден на диске' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async downloadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<StreamableFile> {
    const file = await this.filesService.findOne(id, user);
    
    const fullPath = join(process.cwd(), file.path);
    
    if (!existsSync(fullPath)) {
      throw new NotFoundException('Файл не найден на диске');
    }

    const stream = createReadStream(fullPath);
    
    return new StreamableFile(stream, {
      type: file.mimetype,
      disposition: `attachment; filename="${file.originalName}"`,
    });
  }

  @Delete('files/:id')
  @ApiOperation({ 
    summary: 'Удалить файл',
    description: 'Удаляет файл из базы данных и с диска'
  })
  @ApiParam({ name: 'id', description: 'ID файла', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Файл успешно удален',
    schema: {
      example: {
        success: true,
        data: {
          message: "Файл успешно удален"
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Файл не найден' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.filesService.delete(id, user);
    return { message: 'Файл успешно удален' };
  }

  @Get('todos/:todoId/files')
  @ApiOperation({ 
    summary: 'Получить файлы задачи',
    description: 'Возвращает список всех файлов, привязанных к конкретной задаче'
  })
  @ApiParam({ name: 'todoId', description: 'ID задачи', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список файлов успешно получен',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: "file-uuid",
            filename: "unique-filename.jpg",
            originalName: "my-file.jpg",
            mimetype: "image/jpeg", 
            size: 1024000,
            createdAt: "2025-09-30T10:00:00.000Z"
          }
        ]
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async getFilesByTodo(
    @Param('todoId', ParseUUIDPipe) todoId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<File[]> {
    return this.filesService.findByTodo(todoId, user);
  }
}
