import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, NO_HTML_MESSAGE, NO_HTML_REGEX, uuidSchema } from '../utils.js';

const qabElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('qab'),
  instruction: htmlSchema,
  cards: z
    .array(
      z.object({
        id: uuidSchema,
        text: htmlNotAllowedSchema,
        image: z.object({
          url: z.union([
            z.literal(''),
            z
              .string()
              .url()
              .refine((value) => !NO_HTML_REGEX.test(value), { message: NO_HTML_MESSAGE }),
          ]),
          altText: htmlNotAllowedSchema,
        }),
        proposalA: htmlNotAllowedSchema,
        proposalB: htmlNotAllowedSchema,
        solution: htmlNotAllowedSchema,
      }),
    )
    .min(1)
    .max(6),
  feedback: z.object({ diagnosis: htmlSchema }),
});

export { qabElementSchema };
