import Joi from 'joi';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackSchema } from './feedback-schema.js';
import { proposalContentSchema, shortProposalContentSchema } from './proposal-content-schema.js';

const qcmElementSchema = Joi.alternatives().conditional(Joi.object({ hasShortProposals: true }).unknown(), {
  then: _getQcmElementSchemaWithProposalContentSchema(shortProposalContentSchema),
  otherwise: _getQcmElementSchemaWithProposalContentSchema(proposalContentSchema),
});

export { qcmElementSchema };

function _getQcmElementSchemaWithProposalContentSchema(proposalContentSchema) {
  return Joi.object({
    id: uuidSchema,
    type: Joi.string().valid('qcm').required(),
    instruction: htmlSchema.required(),
    hasShortProposals: Joi.boolean().optional().default(false).required(),
    proposals: Joi.array()
      .items({
        id: proposalIdSchema.required(),
        content: proposalContentSchema.required(),
      })
      .min(3)
      .required(),
    feedbacks: Joi.object({
      valid: feedbackSchema,
      invalid: feedbackSchema,
    }).required(),
    solutions: Joi.array().items(proposalIdSchema).min(2).required(),
  }).required();
}
