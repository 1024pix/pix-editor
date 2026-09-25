import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uri, uuidSchema } from '../utils.js';

export const audioElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['audio']),
  title: htmlNotAllowedSchema(),
  url: uri(),
  transcription: htmlSchema(),
}).meta({ title: 'audio' });
