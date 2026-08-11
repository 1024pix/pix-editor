import { z } from 'zod';

import { htmlSchema } from '../utils.js';

const isPresent = (value) => value !== undefined && value !== '';

export const feedbackSchema = z
  .object({
    state: htmlSchema,
    diagnosis: htmlSchema,
  })
  .refine((data) => isPresent(data.state) || isPresent(data.diagnosis), { message: '"value" must contain at least one of [state, diagnosis]' });
