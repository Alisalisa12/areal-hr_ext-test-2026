import * as Joi from 'joi';
const namePattern = /^[а-яёa-z\s\-']+$/i;
export const createEmployeeSchema = Joi.object({
  last_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(namePattern)
    .required()
    .messages({
      'string.empty': 'Введите фамилию',
      'string.pattern.base':
        'Фамилия может содержать только буквы, дефис и апостроф',
      'any.required': 'Поле "фамилия" обязательно',
    }),
  first_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(namePattern)
    .required()
    .messages({
      'string.empty': 'Введите имя',
      'string.pattern.base':
        'Имя может содержать только буквы, дефис и апостроф',
      'any.required': 'Поле "имя" обязательно',
    }),
  middle_name: Joi.string()
    .trim()
    .max(100)
    .pattern(namePattern)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base':
        'Отчество может содержать только буквы, дефис и апостроф',
    }),
  birth_date: Joi.date().iso().max('now').required().messages({
    'date.format': 'Дата должна быть в формате ДД-ММ-ГГГГ',
    'date.max': 'Дата рождения не может быть в будущем',
    'any.required': 'Дата рождения обязательна',
  }),
});

export const updateEmployeeSchema = createEmployeeSchema.fork(
  ['last_name', 'first_name', 'birth_date'],
  (schema) => schema.optional(),
);
