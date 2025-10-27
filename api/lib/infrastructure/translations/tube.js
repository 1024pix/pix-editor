import { buildTranslationsUtils } from './utils.js';

export const prefix = 'tube.';

const locales = [{ locale: 'fr' }, { locale: 'en' }];

const fields = [{ field: 'practicalTitle' }, { field: 'practicalDescription' }];

const tubeTranslationUtils = buildTranslationsUtils({
  locales,
  fields,
  prefix,
});

export const { extractFromReleaseObject, extractFromDomainObject, toDomain } = tubeTranslationUtils;
