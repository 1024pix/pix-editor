import { z } from 'zod';

import { uuidSchema } from '../utils.js';

const separatorElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('separator'),
});

export { separatorElementSchema };
