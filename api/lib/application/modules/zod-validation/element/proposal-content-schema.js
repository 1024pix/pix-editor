import { z } from 'zod';

import { htmlSchema, NO_HTML_MESSAGE, NO_HTML_REGEX } from '../utils.js';

export const shortProposalContentSchema = z
  .string()
  .max(20)
  .refine((value) => !NO_HTML_REGEX.test(value), { message: NO_HTML_MESSAGE });

export const proposalContentSchema = htmlSchema;
