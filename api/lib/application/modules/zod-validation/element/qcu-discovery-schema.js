import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackNeutralSchema } from './feedback-neutral-schema.js';
import { proposalContentSchema, shortProposalContentSchema } from './proposal-content-schema.js';

const qcuDiscoveryElementSchema = z.union([_getQcuDiscoverySchemaWithProposalContentSchema(shortProposalContentSchema), _getQcuDiscoverySchemaWithProposalContentSchema(proposalContentSchema)]);

function _getQcuDiscoverySchemaWithProposalContentSchema(proposalContentSchema) {
  return z.object({
    id: uuidSchema,
    type: z.literal('qcu-discovery'),
    instruction: htmlSchema,
    hasShortProposals: z.boolean().default(false),
    proposals: z.array(
      z.object({
        id: proposalIdSchema,
        content: proposalContentSchema,
        feedback: feedbackNeutralSchema,
      }),
    ),
    solution: proposalIdSchema,
  });
}
export { qcuDiscoveryElementSchema };
