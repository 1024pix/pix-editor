import { z } from 'zod';

import { string, uri, uuidSchema } from '../utils.js';

export const downloadElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['download']),
  files: z.array(
    z.strictObject({
      url: uri({ scheme: 'https' }),
      format: string(),
    }),
  ),
}).meta({ title: 'download' });
