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
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from '../../common/dto/create-todo.dto';
import { UpdateTodoDto } from '../../common/dto/update-todo.dto';
import { FilterTodoDto } from '../../common/dto/filter-todo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { PaginatedTodos } from './todos.service';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import type { Todo } from './todo.entity';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(
    @Body(ValidationPipe) createTodoDto: CreateTodoDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Todo> {
    return this.todosService.create(createTodoDto, user);
  }

  @Get()
  async findAll(
    @Query(ValidationPipe) filterDto: FilterTodoDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedTodos> {
    return this.todosService.findAll(filterDto, user);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Todo> {
    return this.todosService.findOne(id, user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Todo> {
    return this.todosService.update(id, updateTodoDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.todosService.remove(id, user);
  }

  @Patch(':id/complete')
  async toggleComplete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Todo> {
    return this.todosService.toggleComplete(id, user);
  }
}
