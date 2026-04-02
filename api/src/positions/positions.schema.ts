import * as Joi from 'joi';

export const createPositionSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Название не может быть пустым',
    'string.min': 'Название слишком короткое (минимум 3 символа)',
    'any.required': 'Поле "название" обязательно',
  }),
  comment: Joi.string().max(500).allow('', null).optional(),
});

export const updatePositionSchema = createPositionSchema.fork(
  ['name', 'comment'],
  (schema) => schema.optional(),
);
