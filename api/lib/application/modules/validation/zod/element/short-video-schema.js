import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uri, uuidSchema } from '../utils.js';

export const shortVideoElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['short-video']),
  title: htmlNotAllowedSchema(),
  url: uri(),
  transcription: htmlSchema().optional(),
}).meta({ title: 'short-video' });
