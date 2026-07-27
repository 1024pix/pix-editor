import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const customDraftElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('custom-draft').required(),
  title: htmlNotAllowedSchema.required(),
  url: Joi.string().uri().required(),
  instruction: htmlSchema.allow('').required(),
  height: Joi.number().integer().min(0).max(550).required(),
}).required();

export { customDraftElementSchema };
