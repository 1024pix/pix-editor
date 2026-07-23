import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const shortVideoElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('short-video').required(),
  title: htmlNotAllowedSchema.required(),
  url: Joi.string().uri().required(),
  transcription: htmlSchema.optional(),
}).required();

export { shortVideoElementSchema };
