import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackNeutralSchema } from './feedback-neutral-schema.js';
import { proposalContentSchema, shortProposalContentSchema } from './proposal-content-schema.js';

const qcmDeclarativeElementSchema = z.union([_getQcmDeclarativeSchemaWithProposalContentSchema(shortProposalContentSchema), _getQcmDeclarativeSchemaWithProposalContentSchema(proposalContentSchema)]);

export { qcmDeclarativeElementSchema };

function _getQcmDeclarativeSchemaWithProposalContentSchema(proposalContentSchema) {
  return z.object({
    id: uuidSchema,
    type: z.literal('qcm-declarative'),
    instruction: htmlSchema,
    hasShortProposals: z.boolean().default(false),
    proposals: z.array(
      z.object({
        id: proposalIdSchema,
        content: proposalContentSchema,
      }),
    ),
    feedback: feedbackNeutralSchema,
  });
}
