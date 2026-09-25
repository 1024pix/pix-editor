import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uri, uuidSchema } from '../utils.js';

const image = z.strictObject({ url: uri({ allowEmpty: true }) });

const rectoSide = z.strictObject({
  image: image.optional(),
  text: htmlNotAllowedSchema(),
});

const versoSide = z.strictObject({
  image: image.optional(),
  text: htmlSchema(),
});

export const flashcardsElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['flashcards']),
  instruction: htmlSchema().optional(),
  title: htmlNotAllowedSchema(),
  introImage: image.optional(),
  cards: z.array(
    z.strictObject({
      id: uuidSchema,
      recto: rectoSide.optional(),
      verso: versoSide.optional(),
    }),
  ).optional(),
}).meta({ title: 'flashcards' });
