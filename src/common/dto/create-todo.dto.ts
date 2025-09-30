import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TodoPriority } from '../../modules/todos/todo.entity';

export class CreateTodoDto {
  @ApiProperty({
    description: 'Название задачи',
    example: 'Изучить NestJS',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Описание задачи',
    example: 'Пройти документацию и создать первый проект',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Приоритет задачи',
    enum: TodoPriority,
    example: TodoPriority.MEDIUM,
    default: TodoPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TodoPriority, { message: 'Priority must be low, medium, or high' })
  priority?: TodoPriority = TodoPriority.MEDIUM;

  @ApiPropertyOptional({
    description: 'Срок выполнения задачи',
    example: '2025-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date string' })
  dueDate?: string;
}
