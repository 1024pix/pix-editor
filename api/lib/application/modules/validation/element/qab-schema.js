import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const qabElementSchema = Joi.object({
  id: uuidSchema,
  type: htmlNotAllowedSchema.valid('qab').required(),
  instruction: htmlSchema.required(),
  cards: Joi.array()
    .items({
      id: uuidSchema,
      text: htmlNotAllowedSchema.allow('').required(),
      image: {
        url: htmlNotAllowedSchema.uri().allow('').required(),
        altText: htmlNotAllowedSchema.allow('').required(),
      },
      proposalA: htmlNotAllowedSchema.required(),
      proposalB: htmlNotAllowedSchema.required(),
      solution: htmlNotAllowedSchema.required(),
    })
    .min(1)
    .max(6)
    .required(),
  feedback: Joi.object({ diagnosis: htmlSchema.allow('').required() }).required(),
}).required();

export { qabElementSchema };
