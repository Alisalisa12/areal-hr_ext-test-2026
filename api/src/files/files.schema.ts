import * as Joi from 'joi';

export const createFileSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  category_id: Joi.string().uuid().required(),
});
