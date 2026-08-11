import { z } from 'zod';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackSchema } from './feedback-schema.js';
import { proposalContentSchema, shortProposalContentSchema } from './proposal-content-schema.js';

const qcmElementSchema = z.union([_getQcmElementSchemaWithProposalContentSchema(shortProposalContentSchema), _getQcmElementSchemaWithProposalContentSchema(proposalContentSchema)]);

export { qcmElementSchema };

function _getQcmElementSchemaWithProposalContentSchema(proposalContentSchema) {
  return z.object({
    id: uuidSchema,
    type: z.literal('qcm'),
    instruction: htmlSchema,
    hasShortProposals: z.boolean().default(false),
    proposals: z
      .array(
        z.object({
          id: proposalIdSchema,
          content: proposalContentSchema,
        }),
      )
      .min(3),
    feedbacks: z.object({
      valid: feedbackSchema.optional(),
      invalid: feedbackSchema.optional(),
    }),
    solutions: z.array(proposalIdSchema).min(2),
  });
}
