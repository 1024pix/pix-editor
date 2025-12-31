import translationSchema from './admin-schemas/translation-schema.json' with { type: 'json' };
import releaseSchema from './admin-schemas/release-schema.json' with { type: 'json' };
import userSchema from './admin-schemas/user-schema.json' with { type: 'json' };

export function list() {
  return [
    translationSchema,
    releaseSchema,
    userSchema,
  ].map(stripJsonSchemaReference);
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
