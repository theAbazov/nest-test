import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTodoDto } from './create-todo.dto';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @ApiPropertyOptional({
    description: 'Статус выполнения задачи',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
