import Joi from 'joi';

export const createOrganizationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  comment: Joi.string().max(500).allow(null, ''),
});

export const updateOrganizationSchema = createOrganizationSchema;
