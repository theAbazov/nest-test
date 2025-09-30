import { NotFoundException } from '@nestjs/common';

export class TodoNotFoundException extends NotFoundException {
  constructor(id?: string) {
    const message = id 
      ? `Todo с ID "${id}" не найден или не принадлежит вам`
      : 'Todo не найден или не принадлежит вам';
    super(message);
  }
}
