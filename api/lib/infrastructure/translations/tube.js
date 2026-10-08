import { buildTranslationsUtils } from './utils.js';

export const prefix = 'tube.';

const locales = [{ locale: 'fr' }, { locale: 'en' }];

export const fields = /** @type {const} */ (['practicalTitle', 'practicalDescription']);

const tubeTranslationUtils = buildTranslationsUtils({
  locales,
  fields: fields.map((field) => ({ field })),
  prefix,
});

export const { extractFromReleaseObject, extractFromDomainObject, toDomain } = tubeTranslationUtils;
