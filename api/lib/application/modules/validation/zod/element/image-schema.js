import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, uri, uuidSchema } from '../utils.js';

export const imageElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['image']),
  url: uri(),
  alt: htmlNotAllowedSchema({ allowEmpty: true }),
  alternativeText: htmlSchema({ allowEmpty: true }).optional(),
  legend: htmlNotAllowedSchema({ allowEmpty: true }).optional(),
  licence: htmlNotAllowedSchema({ allowEmpty: true }).optional(),
}).meta({ title: 'image' });
