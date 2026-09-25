import { z } from 'zod';

import { htmlSchema, string, uuidSchema } from '../utils.js';

export const expandElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['expand']),
  title: string(),
  content: htmlSchema(),
}).meta({ title: 'expand' });
