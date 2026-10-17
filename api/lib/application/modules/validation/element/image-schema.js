import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const imageElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('image').required(),
  url: Joi.string().uri().required(),
  alt: htmlNotAllowedSchema.allow('').required(),
  alternativeText: htmlSchema.allow(''),
  legend: htmlNotAllowedSchema.allow(''),
  licence: htmlNotAllowedSchema.allow(''),
  maxWidth: Joi.number().integer().min(0).max(700).required().allow('')
    .description('Largeur maximale de l\'image en pixels (0 à 700). Laisser vide ou 0 pour occuper toute la largeur du module.'),
}).required();

export { imageElementSchema };
