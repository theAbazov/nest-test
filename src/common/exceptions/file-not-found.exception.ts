import { NotFoundException } from '@nestjs/common';

export class FileNotFoundException extends NotFoundException {
  constructor(id?: string) {
    const message = id 
      ? `Файл с ID "${id}" не найден или не принадлежит вам`
      : 'Файл не найден или не принадлежит вам';
    super(message);
  }
}
