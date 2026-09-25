import { conditionalRegistry, forwardIssues, htmlLikeString, htmlNotAllowedSchema, htmlSchema, isPlainObject } from '../utils.js';

export const shortProposalContentSchema = htmlNotAllowedSchema().max(20);
export const proposalContentSchema = htmlSchema();

/**
 * Mimics Joi's `alternatives().conditional(Joi.object({ hasShortProposals: true }).unknown(), { then, otherwise })`:
 * proposals contents are validated against the short or the long content schema depending on `hasShortProposals`.
 * @param {string} title
 * @param {(proposalContentSchema: import('zod').ZodType) => import('zod').ZodObject} buildElementSchema
 */
export function withShortProposals(title, buildElementSchema) {
  const elementSchema = buildElementSchema(htmlLikeString())
    .superRefine(async (element, ctx) => {
      if (!Array.isArray(element.proposals)) {
        return;
      }
      const contentSchema = element.hasShortProposals === true ? shortProposalContentSchema : proposalContentSchema;
      for (const [index, proposal] of element.proposals.entries()) {
        if (typeof proposal?.content === 'string') {
          await forwardIssues(ctx, contentSchema, proposal.content, [
            'proposals',
            index,
            'content',
          ]);
        }
      }
    }, { when: ({ value }) => isPlainObject(value) })
    .meta({ title });

  conditionalRegistry.add(elementSchema, {
    if: { properties: { hasShortProposals: { const: true } } },
    then: buildElementSchema(shortProposalContentSchema),
  });

  return elementSchema;
}
