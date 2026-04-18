import * as Joi from 'joi';

export const createUserSchema = Joi.object({
  role_id: Joi.string().required(),
  employee_id: Joi.string().required(),
  login: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

export const updateUserSchema = Joi.object({
  role_id: Joi.string().optional(),
  employee_id: Joi.string().optional(),
  login: Joi.string().optional(),
  password: Joi.string().min(8).optional(),
});
