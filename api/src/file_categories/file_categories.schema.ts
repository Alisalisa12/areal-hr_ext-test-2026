import * as Joi from 'joi';

export const createFileCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Название категории не может быть пустым',
    'string.min': 'Название категории слишком короткое (минимум 2 символа)',
    'any.required': 'Поле "название" обязательно',
  }),
  comment: Joi.string().max(500).allow('', null).optional().messages({
    'string.max': 'Комментарий слишком длинный (максимум 500 символов)',
  }),
});

export const updateFileCategorySchema = createFileCategorySchema.fork(
  ['name', 'comment'],
  (schema) => schema.optional(),
);
