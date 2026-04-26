import * as Joi from 'joi';

export const createUserSchema = Joi.object({
  role_id: Joi.string().required(),
  employee_id: Joi.string().required(),
  login: Joi.string().min(3).required(),
  password: Joi.string().min(8).max(32).required(),
});

export const updateUserSchema = Joi.object({
  role_id: Joi.string().optional(),
  employee_id: Joi.string().optional(),
  login: Joi.string().min(3).optional(),
  password: Joi.string().min(8).max(32).optional(),
});
