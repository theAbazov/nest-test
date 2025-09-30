import {
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TodoPriority } from '../../modules/todos/todo.entity';

export class FilterTodoDto {
  @ApiPropertyOptional({
    description: 'Фильтр по статусу выполнения',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({
    description: 'Фильтр по приоритету',
    enum: TodoPriority,
    example: TodoPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @ApiPropertyOptional({
    description: 'Фильтр задач с срока выполнения от указанной даты',
    example: '2025-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Фильтр задач с срока выполнения до указанной даты',
    example: '2025-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @ApiPropertyOptional({
    description: 'Поиск по названию и описанию',
    example: 'NestJS',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Номер страницы для пагинации',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Поле для сортировки',
    enum: ['createdAt', 'dueDate', 'priority', 'title'],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Направление сортировки',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
