import { schema as componentsSchema } from '@1024pix/epreuves-components/schema';
import Joi from 'joi';

import { htmlSchema, uuidSchema } from '../utils.js';

const commonProps = {
  id: uuidSchema,
  type: Joi.string().valid('custom').required(),
  title: Joi.string().allow('').required().description("Titre de l'élément interactif ou dynamique. Champ facultatif"),
  instruction: htmlSchema
    .allow('')
    .required()
    .description("Consigne pédagogique de l'élément interactif ou dynamique. Champ facultatif"),
  functionalInstruction: htmlSchema
    .allow('')
    .required()
    .description("Consigne fonctionnelle de l'élément interactif ou dynamique. Champ facultatif"),
};

export const customElementSchema = Joi.alternatives().conditional('.tagName', {
  switch: Object.entries(componentsSchema).map(([tagName, schema]) => ({
    is: tagName,
    then: Joi.object({
      ...commonProps,
      tagName: Joi.string().valid(tagName).required(),
      props: schema,
    })
      .meta({ title: tagName })
      .required(),
  })),
});
