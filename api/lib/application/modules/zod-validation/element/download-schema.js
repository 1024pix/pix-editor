import { z } from 'zod';

import { uuidSchema } from '../utils.js';

const downloadElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('download'),
  files: z.array(
    z.object({
      url: z
        .string()
        .url()
        .refine((value) => value.startsWith('https://'), { message: 'url must use the https scheme' }),
      format: z.string(),
    }),
  ),
});

export { downloadElementSchema };
