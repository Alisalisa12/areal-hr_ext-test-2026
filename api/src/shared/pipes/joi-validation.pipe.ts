import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import type { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}
  transform(value: Record<string, any>) {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException({
        error: 'Validation failed',
        message: error.message.replace(/["\\]/g, ''),
      });
    }
    return value;
  }
}
