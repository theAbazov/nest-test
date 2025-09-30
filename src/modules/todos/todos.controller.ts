import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
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
  ApiQuery,
} from '@nestjs/swagger';
import { TodosService } from './todos.service';
import { CreateTodoDto } from '../../common/dto/create-todo.dto';
import { UpdateTodoDto } from '../../common/dto/update-todo.dto';
import { FilterTodoDto } from '../../common/dto/filter-todo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { PaginatedTodos } from './todos.service';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import type { Todo } from './todo.entity';

@ApiTags('Todos')
@ApiBearerAuth('JWT-auth')
@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Создать новую задачу',
    description: 'Создает новую задачу для текущего пользователя'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Задача успешно создана'
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации данных' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Todo> {
    return this.todosService.create(createTodoDto, user);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Получить список задач',
    description: 'Возвращает список задач текущего пользователя с фильтрацией и пагинацией'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Список задач успешно получен',
    schema: {
      example: {
        success: true,
        data: {
          todos: [],
          total: 0,
          page: 1,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async findAll(
    @Query() filterDto: FilterTodoDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedTodos> {
    return this.todosService.findAll(filterDto, user);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Получить задачу по ID',
    description: 'Возвращает конкретную задачу пользователя по её ID'
  })
  @ApiParam({ name: 'id', description: 'ID задачи', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Задача найдена'
  })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Todo> {
    return this.todosService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Обновить задачу',
    description: 'Обновляет существующую задачу пользователя'
  })
  @ApiParam({ name: 'id', description: 'ID задачи', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Задача успешно обновлена'
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации данных' })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Удалить задачу',
    description: 'Удаляет задачу и все связанные с ней файлы'
  })
  @ApiParam({ name: 'id', description: 'ID задачи', format: 'uuid' })
  @ApiResponse({ 
    status: 204, 
    description: 'Задача успешно удалена'
  })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.todosService.remove(id, user);
  }

  @Patch(':id/complete')
  @ApiOperation({ 
    summary: 'Переключить статус выполнения',
    description: 'Переключает статус задачи между выполненной и невыполненной'
  })
  @ApiParam({ name: 'id', description: 'ID задачи', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Статус задачи успешно изменен'
  })
  @ApiNotFoundResponse({ description: 'Задача не найдена' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async toggleComplete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Todo> {
    return this.todosService.toggleComplete(id, user);
  }
}
