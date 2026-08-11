import { schema as componentsSchema } from '@1024pix/epreuves-components/schema';
import { z } from 'zod';

import { htmlSchema, uuidSchema } from '../utils.js';

const commonProps = {
  id: uuidSchema,
  type: z.literal('custom'),
  title: z.string().describe("Titre de l'élément interactif ou dynamique. Champ facultatif"),
  instruction: htmlSchema.describe("Consigne pédagogique de l'élément interactif ou dynamique. Champ facultatif"),
  functionalInstruction: htmlSchema.describe(
    "Consigne fonctionnelle de l'élément interactif ou dynamique. Champ facultatif",
  ),
};

export const customElementSchema = z.union(
  Object.entries(componentsSchema).map(([tagName, joiPropsSchema]) =>
    z
      .object({
        ...commonProps,
        tagName: z.literal(tagName),
        // props is validated against the Joi schema exposed by the (non-zod) @1024pix/epreuves-components package
        props: z.custom((value) => !joiPropsSchema.validate(value).error, { message: `invalid props for tagName "${tagName}"` }),
      })
      .describe(tagName),
  ),
);
