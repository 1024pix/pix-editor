import { htmlNotAllowedSchema, htmlSchema } from '../utils.js';

export const shortProposalContentSchema = htmlNotAllowedSchema.max(20);

export const proposalContentSchema = htmlSchema;
