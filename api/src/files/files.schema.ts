import * as Joi from 'joi';

export const createFileSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  category_id: Joi.string().uuid().required().messages({
    'any.required': 'Категория файла обязательна',
  }),
  name: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Имя файла не может быть пустым',
  }),
  storage_path: Joi.string().required(),
  mime_type: Joi.string().required(),
});
