import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const customDraftElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('custom-draft'),
  title: htmlNotAllowedSchema,
  url: z.string().url(),
  instruction: htmlSchema,
  height: z.number().int().min(0).max(550),
});

export { customDraftElementSchema };
