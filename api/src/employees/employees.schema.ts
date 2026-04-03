import * as Joi from 'joi';

export const createEmployeeSchema = Joi.object({
  last_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Введите фамилию',
    'any.required': 'Поле "фамилия" обязательно',
  }),
  first_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Введите имя',
    'any.required': 'Поле "имя" обязательно',
  }),
  middle_name: Joi.string().max(100).allow('', null).optional(),
  birth_date: Joi.date().iso().max('now').required().messages({
    'date.format': 'Дата рождения должна быть в формате ГГГГ-ММ-ДД',
    'date.max': 'Дата рождения не может быть в будущем',
    'any.required': 'Дата рождения обязательна',
  }),
});

export const updateEmployeeSchema = createEmployeeSchema.fork(
  ['last_name', 'first_name', 'birth_date'],
  (schema) => schema.optional(),
);
