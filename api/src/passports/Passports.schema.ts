import * as Joi from 'joi';

export const createPassportSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  series: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Серия должна состоять ровно из 4 цифр',
      'any.required': 'Введите серию паспорта',
    }),

  number: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Номер должен состоять ровно из 6 цифр',
      'any.required': 'Введите номер паспорта',
    }),

  issue_date: Joi.date().iso().required().messages({
    'date.format': 'Некорректный формат даты',
    'any.required': 'Дата выдачи обязательна',
  }),

  issuer_code: Joi.string().required().messages({
    'any.required': 'Код подразделения обязателен',
  }),

  issued_by: Joi.string().min(5).required().messages({
    'string.min': 'Наименование учреждения слишком короткое',
    'any.required': 'Поле "Кем выдан" обязательно',
  }),
});

export const updatePassportSchema = createPassportSchema.fork(
  ['series', 'number', 'issue_date', 'issuer_code', 'issued_by'],
  (schema) => schema.optional(),
);
