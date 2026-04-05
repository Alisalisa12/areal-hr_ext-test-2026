import * as Joi from 'joi';
import { EntityType } from './entities/audit_log.entity';

const uuidSchema = Joi.string().guid({ version: 'uuidv4' });

export const createAuditLogSchema = Joi.object({
  entity_id: uuidSchema.required(),
  entity_type: Joi.string()
    .valid(...Object.values(EntityType))
    .required()
    .messages({
      'any.only': 'Недопустимый тип',
      'any.required': 'Тип обязателен',
    }),
  field_name: Joi.string().required(),
  old_value: Joi.string().allow(null, '').optional(),
  new_value: Joi.string().allow(null, '').optional(),
});

export const updateAuditLogSchema = createAuditLogSchema.fork(
  ['entity_id', 'entity_type', 'field_name', 'old_value', 'new_value'],
  (schema) => schema.optional(),
);
