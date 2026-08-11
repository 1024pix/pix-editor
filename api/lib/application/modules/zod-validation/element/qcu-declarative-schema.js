import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackNeutralSchema } from './feedback-neutral-schema.js';
import { proposalContentSchema, shortProposalContentSchema } from './proposal-content-schema.js';

const qcuDeclarativeElementSchema = z.union([_getQcuDeclarativeSchemaWithProposalContentSchema(shortProposalContentSchema), _getQcuDeclarativeSchemaWithProposalContentSchema(proposalContentSchema)]);

export { qcuDeclarativeElementSchema };

function _getQcuDeclarativeSchemaWithProposalContentSchema(proposalContentSchema) {
  return z.object({
    id: uuidSchema,
    type: z.literal('qcu-declarative'),
    instruction: htmlSchema,
    hasShortProposals: z.boolean().default(false),
    proposals: z.array(
      z.object({
        id: proposalIdSchema,
        content: proposalContentSchema,
        feedback: feedbackNeutralSchema,
      }),
    ),
  });
}
