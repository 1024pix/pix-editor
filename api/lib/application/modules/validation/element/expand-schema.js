import Joi from 'joi';

import { htmlSchema, uuidSchema } from '../utils.js';

const expandElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('expand').required(),
  title: Joi.string().required(),
  content: htmlSchema.required(),
}).required();

export { expandElementSchema };
