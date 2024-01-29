import { buildTranslationsUtils } from './utils.js';

export const prefix = 'area.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Titre', field: 'title' },
];

const idField = 'id persistant';

export const {
  extractFromProxyObject,
  prefixFor,
} = buildTranslationsUtils({ locales, fields, prefix, idField });
