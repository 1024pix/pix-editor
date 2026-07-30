import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const embedElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('embed').required(),
  isCompletionRequired: Joi.boolean().required(),
  title: htmlNotAllowedSchema.required(),
  url: Joi.string().uri().required(),
  instruction: htmlSchema.optional(),
  solution: Joi.string().allow('').optional(),
  height: Joi.number().min(0).required(),
}).required();

export { embedElementSchema };
