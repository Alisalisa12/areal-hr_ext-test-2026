import * as Joi from 'joi';

export const createAddressSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),

  region: Joi.string().min(2).required().messages({
    'string.min': 'Название региона слишком короткое',
    'any.required': 'Укажите регион',
  }),

  city: Joi.string().min(2).required().messages({
    'string.min': 'Название города слишком короткое',
    'any.required': 'Укажите город',
  }),

  street: Joi.string().min(2).required().messages({
    'string.min': 'Название улицы слишком короткое',
    'any.required': 'Укажите улицу',
  }),

  house: Joi.string().required().messages({
    'any.required': 'Номер дома обязателен',
  }),

  block: Joi.string().allow('', null).optional(),

  flat: Joi.string().allow('', null).optional(),
});

export const updateAddressSchema = createAddressSchema.fork(
  ['region', 'city', 'street', 'house', 'block', 'flat'],
  (schema) => schema.optional(),
);
