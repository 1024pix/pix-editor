import userSchema from './admin-schemas/user-schema.json' with { type: 'json' };

export function list() {
  return [userSchema].map(stripJsonSchemaReference);
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
