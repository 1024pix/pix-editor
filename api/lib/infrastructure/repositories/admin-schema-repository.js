import localizedChallengeSchema from './admin-schemas/localized-challenge-schema.json' with { type: 'json' };
import translationSchema from './admin-schemas/translation-schema.json' with { type: 'json' };
import releaseSchema from './admin-schemas/release-schema.json' with { type: 'json' };
import userSchema from './admin-schemas/user-schema.json' with { type: 'json' };
import translationsConfigSchema from './admin-schemas/translations-config-schema.json' with { type: 'json' };
import externalUrlsSchema from './admin-schemas/external-urls-schema.json' with { type: 'json' };
import brokenUrlsSchema from './admin-schemas/broken-urls-schema.json' with { type: 'json' };

export function list() {
  return [
    localizedChallengeSchema,
    releaseSchema,
    translationSchema,
    translationsConfigSchema,
    userSchema,
    externalUrlsSchema,
    brokenUrlsSchema,
  ].map(stripJsonSchemaReference);
}

/**
 * @param {string} name
 */
export function getByEntityName(name) {
  return list().find(({ entityName }) => entityName === name);
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
