import { zodIssuesToJoiDetails } from './zod-issues-to-joi-details.js';

export class ModuleSchemaValidationError extends Error {
  constructor(details) {
    super(details.map(({ message }) => message).join('. '));
    this.name = 'ModuleSchemaValidationError';
    this.details = details;
  }
}

/**
 * Validates `value` against a module Zod schema, throwing a Joi-like `ModuleSchemaValidationError`.
 */
export async function validateAsync(schema, value) {
  const result = await schema.safeParseAsync(value, { reportInput: true });
  if (!result.success) {
    throw new ModuleSchemaValidationError(zodIssuesToJoiDetails(result.error.issues));
  }
  return result.data;
}
