import { buildTranslationsUtils } from './utils.js';

export const prefix = 'area.';

const locales = [{ locale: 'fr' }, { locale: 'en' }];

const fields = [{ field: 'title' }];

const areaTranslationUtils = buildTranslationsUtils({
  locales,
  fields,
  prefix,
});

export const { extractFromReleaseObject, toDomain, extractFromDomainObject } = areaTranslationUtils;
