import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uri, uuidSchema } from '../utils.js';

export const videoElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['video']),
  title: htmlNotAllowedSchema(),
  url: uri(),
  poster: uri().optional(),
  subtitles: uri({ allowEmpty: true }),
  transcription: htmlSchema({ allowEmpty: true }).optional(),
}).meta({ title: 'video' });
