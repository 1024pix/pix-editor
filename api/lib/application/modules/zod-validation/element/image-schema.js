import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from '../utils.js';

const imageElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('image'),
  url: z.string().url(),
  alt: htmlNotAllowedSchema,
  alternativeText: htmlSchema.optional(),
  legend: htmlNotAllowedSchema.optional(),
  licence: htmlNotAllowedSchema.optional(),
});

export { imageElementSchema };
