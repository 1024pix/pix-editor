import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackNeutralSchema } from './feedback-neutral-schema.js';
import { withShortProposals } from './proposal-content-schema.js';

export const qcuDiscoveryElementSchema = withShortProposals('qcu-discovery', (proposalContentSchema) =>
  z.strictObject({
    id: uuidSchema,
    type: z.enum(['qcu-discovery']),
    instruction: htmlSchema(),
    hasShortProposals: z.boolean(),
    proposals: z.array(
      z.strictObject({
        id: proposalIdSchema(),
        content: proposalContentSchema,
        feedback: feedbackNeutralSchema,
      }),
    ),
    solution: proposalIdSchema(),
  }),
);
