import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const audioElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('audio').required(),
  title: htmlNotAllowedSchema.required(),
  url: Joi.string().uri().required(),
  transcription: htmlSchema.required(),
}).required();

export { audioElementSchema };
