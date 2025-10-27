import { buildTranslationsUtils } from './utils.js';

export const prefix = 'thematic.';

const locales = [{ locale: 'fr' }, { locale: 'en' }];

const fields = [{ field: 'name' }];

const thematicTranslationUtils = buildTranslationsUtils({
  locales,
  fields,
  prefix,
});

export const { extractFromDomainObject, extractFromReleaseObject, toDomain } = thematicTranslationUtils;
