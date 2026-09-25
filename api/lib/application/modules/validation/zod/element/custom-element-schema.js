import { schema as componentsSchema } from '@1024pix/epreuves-components/schema';
import { z } from 'zod';

import { describe, htmlSchema, string, switchOn, uuidSchema } from '../utils.js';
import { isRequired, joiPropsToZod } from './joi-props-to-zod.js';

const commonProps = {
  id: uuidSchema,
  type: z.enum(['custom']),
  title: describe(string({ allowEmpty: true }), "Titre de l'élément interactif ou dynamique. Champ facultatif"),
  instruction: describe(
    htmlSchema({ allowEmpty: true }),
    "Consigne pédagogique de l'élément interactif ou dynamique. Champ facultatif",
  ),
  functionalInstruction: describe(
    htmlSchema({ allowEmpty: true }),
    "Consigne fonctionnelle de l'élément interactif ou dynamique. Champ facultatif",
  ),
};

export const customElementSchema = switchOn(
  'tagName',
  Object.entries(componentsSchema).map(([tagName, joiPropsSchema]) => {
    const propsSchema = joiPropsToZod(joiPropsSchema);
    return z.strictObject({
      ...commonProps,
      tagName: z.enum([tagName]),
      props: isRequired(joiPropsSchema) ? propsSchema : propsSchema.optional(),
    }).meta({ title: tagName });
  }),
).meta({ title: 'custom' });
