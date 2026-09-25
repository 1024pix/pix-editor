import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, maxItems, uri, uuidSchema } from '../utils.js';

export const qabElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['qab']),
  instruction: htmlSchema(),
  cards: maxItems(
    z.array(
      z.strictObject({
        id: uuidSchema,
        text: htmlNotAllowedSchema({ allowEmpty: true }),
        image: z.strictObject({
          url: uri({ allowEmpty: true, htmlNotAllowed: true }),
          altText: htmlNotAllowedSchema({ allowEmpty: true }),
        }).optional(),
        proposalA: htmlNotAllowedSchema(),
        proposalB: htmlNotAllowedSchema(),
        solution: htmlNotAllowedSchema(),
      }),
    ).min(1),
    6,
  ),
  feedback: z.strictObject({ diagnosis: htmlSchema({ allowEmpty: true }) }),
}).meta({ title: 'qab' });
