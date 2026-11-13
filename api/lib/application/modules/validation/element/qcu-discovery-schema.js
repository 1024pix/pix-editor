import Joi from 'joi';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackNeutralSchema } from './feedback-neutral-schema.js';
import { proposalContentSchema, shortProposalContentSchema } from './proposal-content-schema.js';

const qcuDiscoveryElementSchema = Joi.alternatives().conditional(Joi.object({ hasShortProposals: true }).unknown(), {
  then: _getQcuDiscoverySchemaWithProposalContentSchema(shortProposalContentSchema),
  otherwise: _getQcuDiscoverySchemaWithProposalContentSchema(proposalContentSchema),
});

function _getQcuDiscoverySchemaWithProposalContentSchema(proposalContentSchema) {
  return Joi.object({
    id: uuidSchema,
    type: Joi.string().valid('qcu-discovery').required(),
    instruction: htmlSchema.required(),
    hasShortProposals: Joi.boolean().optional().default(false).required(),
    proposals: Joi.array()
      .items({
        id: proposalIdSchema.required(),
        content: proposalContentSchema.required(),
        feedback: feedbackNeutralSchema.required(),
      })
      .required(),
    solution: proposalIdSchema.required(),
  }).custom((value, helpers) => {
    const proposalIds = value.proposals.map((proposal) => proposal.id);
    if (!proposalIds.includes(value.solution)) {
      return helpers.message('{{#label}} : La solution doit correspondre à une proposition existante');
    }
    return value;
  });
}
export { qcuDiscoveryElementSchema };
