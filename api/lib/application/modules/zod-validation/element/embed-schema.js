import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const embedElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('embed'),
  isCompletionRequired: z.boolean(),
  title: htmlNotAllowedSchema,
  url: z.string().url(),
  instruction: htmlSchema.optional(),
  solution: z.string().optional(),
  height: z.number().min(0),
});

export { embedElementSchema };
