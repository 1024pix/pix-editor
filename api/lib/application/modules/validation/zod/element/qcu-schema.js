import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackSchema } from './feedback-schema.js';
import { withShortProposals } from './proposal-content-schema.js';

export const qcuElementSchema = withShortProposals('qcu', (proposalContentSchema) =>
  z.strictObject({
    id: uuidSchema,
    type: z.enum(['qcu']),
    instruction: htmlSchema(),
    hasShortProposals: z.boolean(),
    proposals: z.array(
      z.strictObject({
        id: proposalIdSchema(),
        content: proposalContentSchema,
        feedback: feedbackSchema,
      }),
    ),
    solution: proposalIdSchema(),
  }),
);
