import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { TodoPriority } from '../../modules/todos/todo.entity';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(TodoPriority, { message: 'Priority must be low, medium, or high' })
  priority?: TodoPriority = TodoPriority.MEDIUM;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date string' })
  dueDate?: string;
}
