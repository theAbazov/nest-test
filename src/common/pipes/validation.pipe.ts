import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GlobalValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true, // Удаляет свойства, которые не имеют декораторов
      forbidNonWhitelisted: true, // Выбрасывает ошибку для лишних свойств
      transform: true, // Автоматически трансформирует типы
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Ошибка валидации',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    errors.forEach(error => {
      const property = error.property;
      const constraints = error.constraints;

      if (constraints) {
        formattedErrors[property] = Object.values(constraints);
      }

      // Рекурсивно обрабатываем вложенные ошибки
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children);
        Object.keys(nestedErrors).forEach(nestedProperty => {
          const fullProperty = `${property}.${nestedProperty}`;
          formattedErrors[fullProperty] = nestedErrors[nestedProperty];
        });
      }
    });

    return formattedErrors;
  }
}
