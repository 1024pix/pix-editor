import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const image = z.object({ url: z.union([z.string().url(), z.literal('')]) });

const rectoSide = z.object({
  image: image.optional(),
  text: htmlNotAllowedSchema,
});

const versoSide = z.object({
  image: image.optional(),
  text: htmlSchema,
});

const flashcardsElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('flashcards'),
  instruction: htmlSchema.optional(),
  title: htmlNotAllowedSchema,
  introImage: image.optional(),
  cards: z
    .array(
      z.object({
        id: uuidSchema,
        recto: rectoSide,
        verso: versoSide,
      }),
    )
    .optional(),
});

export { flashcardsElementSchema };
