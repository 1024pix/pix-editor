import releaseSchema from './admin-schemas/release-schema.json' with { type: 'json' };
import userSchema from './admin-schemas/user-schema.json' with { type: 'json' };

export function list() {
  return [userSchema, releaseSchema].map(stripJsonSchemaReference);
}

/**
 * @function
 * @template T
 * @param {T} obj
 * @returns {Omit<T, "$schema">}
 */
function stripJsonSchemaReference({ $schema: _$schema, ...obj }) {
  return obj;
}
