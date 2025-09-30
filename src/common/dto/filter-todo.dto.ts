import {
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsString,
  IsNumberString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TodoPriority } from '../../modules/todos/todo.entity';

export class FilterTodoDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
