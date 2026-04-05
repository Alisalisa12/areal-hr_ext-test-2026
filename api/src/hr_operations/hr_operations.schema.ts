import * as Joi from 'joi';
import { HrOperationType } from './entities/hr_operation.entity';

const uuidSchema = Joi.string().guid({ version: 'uuidv4' });

export const createHrOperationSchema = Joi.object({
  employee_id: uuidSchema.required(),
  department_id: uuidSchema.allow(null, '').optional(),
  position_id: uuidSchema.allow(null, '').optional(),
  type: Joi.string()
    .valid(...Object.values(HrOperationType))
    .required()
    .messages({
      'any.only': 'Недопустимый тип операции',
      'any.required': 'Тип операции обязателен',
    }),
});

export const updateHrOperationSchema = createHrOperationSchema.fork(
  ['employee_id', 'department_id', 'position_id', 'type'],
  (schema) => schema.optional(),
);
