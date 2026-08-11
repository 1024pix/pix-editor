import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackSchema } from './feedback-schema.js';
import { proposalContentSchema, shortProposalContentSchema } from './proposal-content-schema.js';

const qcuElementSchema = z.union([_getQcuSchemaWithProposalContentSchema(shortProposalContentSchema), _getQcuSchemaWithProposalContentSchema(proposalContentSchema)]);

export { qcuElementSchema };

function _getQcuSchemaWithProposalContentSchema(proposalContentSchema) {
  return z.object({
    id: uuidSchema,
    type: z.literal('qcu'),
    instruction: htmlSchema,
    hasShortProposals: z.boolean().default(false),
    proposals: z.array(
      z.object({
        id: proposalIdSchema,
        content: proposalContentSchema,
        feedback: feedbackSchema,
      }),
    ),
    solution: proposalIdSchema,
  });
}
