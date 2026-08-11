import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const videoElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('video'),
  title: htmlNotAllowedSchema,
  url: z.string().url(),
  poster: z.string().url().optional(),
  subtitles: z.union([z.string().url(), z.literal('')]),
  transcription: htmlSchema.optional(),
});

export { videoElementSchema };
