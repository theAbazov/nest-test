import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Todo } from './todo.entity';
import { User } from '../users/user.entity';
import { CreateTodoDto } from '../../common/dto/create-todo.dto';
import { UpdateTodoDto } from '../../common/dto/update-todo.dto';
import { FilterTodoDto } from '../../common/dto/filter-todo.dto';
import { FilesService } from '../files/files.service';
import { TodoWebSocketGateway } from '../websocket/websocket.gateway';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

export interface PaginatedTodos {
  todos: Todo[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo)
    private todoModel: typeof Todo,
    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,
    @Inject(forwardRef(() => TodoWebSocketGateway))
    private websocketGateway: TodoWebSocketGateway,
  ) {}

  async create(createTodoDto: CreateTodoDto, user: JwtPayload): Promise<Todo> {
    const todoData: any = {
      title: createTodoDto.title,
      description: createTodoDto.description,
      priority: createTodoDto.priority,
      dueDate: createTodoDto.dueDate ? new Date(createTodoDto.dueDate) : null,
      userId: user.id,
    };

    const todo = await this.todoModel.create(todoData);

    // Отправляем WebSocket событие о создании todo
    try {
      this.websocketGateway.emitTodoCreated(user.id, todo);
    } catch (error) {
      console.error('Failed to emit todo:created event:', error);
    }

    return todo;
  }

  async findAll(
    filterDto: FilterTodoDto,
    user: JwtPayload,
  ): Promise<PaginatedTodos> {
    const {
      completed,
      priority,
      dueDateFrom,
      dueDateTo,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filterDto;

    const offset = (page - 1) * limit;

    // Построение условий фильтрации
    const whereConditions: WhereOptions<Todo> = {
      userId: user.id,
    };

    if (completed !== undefined) {
      whereConditions.completed = completed;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    if (dueDateFrom || dueDateTo) {
      const dueDateCondition: any = {};
      if (dueDateFrom) {
        dueDateCondition[Op.gte] = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        dueDateCondition[Op.lte] = new Date(dueDateTo);
      }
      Object.assign(whereConditions, { dueDate: dueDateCondition });
    }

    if (search) {
      Object.assign(whereConditions, {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    const { count, rows } = await this.todoModel.findAndCountAll({
      where: whereConditions,
      order: [[sortBy || 'createdAt', sortOrder || 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      todos: rows,
      total: count,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string, user: JwtPayload): Promise<Todo> {
    const todo = await this.todoModel.findOne({
      where: { id, userId: user.id },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async update(
    id: string,
    updateTodoDto: UpdateTodoDto,
    user: JwtPayload,
  ): Promise<Todo> {
    const todo = await this.findOne(id, user);

    const updateData: any = {};
    
    if (updateTodoDto.title !== undefined) {
      updateData.title = updateTodoDto.title;
    }
    if (updateTodoDto.description !== undefined) {
      updateData.description = updateTodoDto.description;
    }
    if (updateTodoDto.priority !== undefined) {
      updateData.priority = updateTodoDto.priority;
    }
    if (updateTodoDto.completed !== undefined) {
      updateData.completed = updateTodoDto.completed;
    }
    if (updateTodoDto.dueDate !== undefined) {
      updateData.dueDate = updateTodoDto.dueDate ? new Date(updateTodoDto.dueDate) : null;
    }

    await todo.update(updateData);
    await todo.reload({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    // Отправляем WebSocket событие о обновлении todo
    try {
      this.websocketGateway.emitTodoUpdated(user.id, todo);
    } catch (error) {
      console.error('Failed to emit todo:updated event:', error);
    }

    return todo;
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const todo = await this.findOne(id, user);
    
    // Удаляем все связанные файлы
    try {
      await this.filesService.deleteFilesByTodo(id);
    } catch (error) {
      console.error('Ошибка при удалении файлов todo:', error);
      // Продолжаем выполнение для удаления самого todo
    }
    
    await todo.destroy();

    // Отправляем WebSocket событие об удалении todo
    try {
      this.websocketGateway.emitTodoDeleted(user.id, id);
    } catch (error) {
      console.error('Failed to emit todo:deleted event:', error);
    }
  }

  async toggleComplete(id: string, user: JwtPayload): Promise<Todo> {
    const todo = await this.findOne(id, user);
    const wasCompleted = todo.completed;
    
    await todo.update({ completed: !todo.completed });
    await todo.reload({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    // Отправляем WebSocket событие о завершении todo
    try {
      if (!wasCompleted && todo.completed) {
        // Todo было помечено как завершенное
        this.websocketGateway.emitTodoCompleted(user.id, todo);
      } else {
        // Todo было обновлено (статус изменен)
        this.websocketGateway.emitTodoUpdated(user.id, todo);
      }
    } catch (error) {
      console.error('Failed to emit todo completion event:', error);
    }

    return todo;
  }

}
