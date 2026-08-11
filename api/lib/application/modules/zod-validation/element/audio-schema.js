import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const audioElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('audio'),
  title: htmlNotAllowedSchema,
  url: z.string().url(),
  transcription: htmlSchema,
});

export { audioElementSchema };
