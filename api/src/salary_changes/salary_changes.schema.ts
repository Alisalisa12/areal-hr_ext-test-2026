import * as Joi from 'joi';

export const createSalaryChangeSchema = Joi.object({
  operation_id: Joi.string().uuid().required(),
  old_salary: Joi.number().precision(2).min(0).required().messages({
    'number.base': 'Предыдущая зарплата должна быть числом',
    'any.required': 'Поле "предыдущая зарплата" обязательно',
  }),
  new_salary: Joi.number().precision(2).min(0).required().messages({
    'number.base': 'Новая зарплата должна быть числом',
    'any.required': 'Поле "новая зарплата" обязательно',
  }),
  reason: Joi.string().min(5).max(1000).required().messages({
    'string.empty': 'Причина не может быть пустой',
    'string.min': 'Причина слишком короткая (минимум 5 символов)',
    'any.required': 'Поле "причина" обязательно',
  }),
  changed_at: Joi.date().iso().optional(),
});

export const updateSalaryChangeSchema = createSalaryChangeSchema.fork(
  ['operation_id', 'old_salary', 'new_salary', 'reason', 'changed_at'],
  (schema) => schema.optional(),
);
