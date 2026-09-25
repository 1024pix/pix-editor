import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackNeutralSchema } from './feedback-neutral-schema.js';
import { withShortProposals } from './proposal-content-schema.js';

export const qcuDeclarativeElementSchema = withShortProposals('qcu-declarative', (proposalContentSchema) =>
  z.strictObject({
    id: uuidSchema,
    type: z.enum(['qcu-declarative']),
    instruction: htmlSchema(),
    hasShortProposals: z.boolean(),
    proposals: z.array(
      z.strictObject({
        id: proposalIdSchema(),
        content: proposalContentSchema,
        feedback: feedbackNeutralSchema,
      }),
    ),
  }),
);
