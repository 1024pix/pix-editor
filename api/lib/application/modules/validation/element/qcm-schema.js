import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackSchema } from './feedback-schema.js';
import { withShortProposals } from './proposal-content-schema.js';

export const qcmElementSchema = withShortProposals('qcm', (proposalContentSchema) =>
  z.strictObject({
    id: uuidSchema,
    type: z.enum(['qcm']),
    instruction: htmlSchema(),
    hasShortProposals: z.boolean(),
    proposals: z.array(
      z.strictObject({
        id: proposalIdSchema(),
        content: proposalContentSchema,
      }),
    ).min(3),
    feedbacks: z.strictObject({
      valid: feedbackSchema.optional(),
      invalid: feedbackSchema.optional(),
    }),
    solutions: z.array(proposalIdSchema()).min(2),
  }),
);
