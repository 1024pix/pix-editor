import { z } from 'zod';

import { htmlSchema, uuidSchema } from '../utils.js';

const textElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('text'),
  tag: z
    .enum([
      ' ',
      'context',
      'did-you-know',
      'further-information',
      'tip',
    ])
    .describe("Tag qui s'affiche au dessus du texte. Champ facultatif (laisser vide si pas de tag souhaité)"),
  content: htmlSchema,
});

export { textElementSchema };
