import { buildTranslationsUtils } from './utils.js';

export const prefix = 'area.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Titre', field: 'title' },
];

const idField = 'fields.id persistant';

const areaTranslationUtils = buildTranslationsUtils({ locales, fields, prefix, idField });

export const {
  extractFromProxyObject,
  extractFromReleaseObject,
  prefixFor,
  toDomain,
  extractFromDomainObject,
} = areaTranslationUtils;
