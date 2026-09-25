import { z } from 'zod';

import { describe, htmlSchema, uuidSchema } from '../utils.js';

export const textElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['text']),
  tag: describe(
    z.enum([
      ' ',
      'context',
      'did-you-know',
      'further-information',
      'tip',
    ]),
    "Tag qui s'affiche au dessus du texte. Champ facultatif (laisser vide si pas de tag souhaité)",
  ),
  content: htmlSchema(),
}).meta({ title: 'text' });
