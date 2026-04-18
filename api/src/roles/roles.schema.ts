import * as Joi from 'joi';

export const createRoleSchema = Joi.object({
  name: Joi.string().required().max(255),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().optional().max(255),
});
