import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uri, uuidSchema } from '../utils.js';

export const customDraftElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['custom-draft']),
  title: htmlNotAllowedSchema(),
  url: uri(),
  instruction: htmlSchema({ allowEmpty: true }),
  height: z.int().min(0).max(550),
}).meta({ title: 'custom-draft' });
