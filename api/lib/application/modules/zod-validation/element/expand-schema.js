import { z } from 'zod';

import { htmlSchema, uuidSchema } from '../utils.js';

const expandElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('expand'),
  title: z.string(),
  content: htmlSchema,
});

export { expandElementSchema };
