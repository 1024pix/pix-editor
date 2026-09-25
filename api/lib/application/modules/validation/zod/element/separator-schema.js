import { z } from 'zod';

import { uuidSchema } from '../utils.js';

export const separatorElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['separator']),
}).meta({ title: 'separator' });
