import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const shortVideoElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('short-video'),
  title: htmlNotAllowedSchema,
  url: z.string().url(),
  transcription: htmlSchema.optional(),
});

export { shortVideoElementSchema };
