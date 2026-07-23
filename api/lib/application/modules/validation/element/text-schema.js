import Joi from 'joi';

import { htmlSchema, uuidSchema } from '../utils.js';

const textElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('text').required(),
  tag: Joi.string()
    .valid(' ', 'context', 'did-you-know', 'further-information', 'tip')
    .required()
    .description("Tag qui s'affiche au dessus du texte. Champ facultatif (laisser vide si pas de tag souhaité)"),
  content: htmlSchema.required(),
}).required();

export { textElementSchema };
