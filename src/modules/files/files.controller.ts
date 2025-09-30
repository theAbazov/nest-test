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
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { multerConfig } from '../../config/multer.config';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import type { File } from './file.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('files/upload/:todoId')
  @UseInterceptors(FileInterceptor('file', multerConfig))
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
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.filesService.delete(id, user);
    return { message: 'Файл успешно удален' };
  }

  @Get('todos/:todoId/files')
  async getFilesByTodo(
    @Param('todoId', ParseUUIDPipe) todoId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<File[]> {
    return this.filesService.findByTodo(todoId, user);
  }
}
