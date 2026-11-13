import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema, withAssetsHostname } from '../utils.js';

const videoElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('video').required(),
  title: htmlNotAllowedSchema.required(),
  url: withAssetsHostname(Joi.string().uri().required()),
  poster: Joi.string().uri(),
  subtitles: withAssetsHostname(Joi.string().uri().allow('').required()),
  transcription: htmlSchema.allow(''),
}).required();

export { videoElementSchema };
