import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, string, uri, uuidSchema } from '../utils.js';

export const embedElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['embed']),
  isCompletionRequired: z.boolean(),
  title: htmlNotAllowedSchema(),
  url: uri(),
  instruction: htmlSchema().optional(),
  solution: string({ allowEmpty: true }).optional(),
  height: z.number().min(0),
}).meta({ title: 'embed' });
