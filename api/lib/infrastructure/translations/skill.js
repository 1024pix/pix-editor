import { buildTranslationsUtils } from './utils.js';

export const prefix = 'skill.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Indice', field: 'hint' },
];

const idField = 'id persistant';

export const {
  extractFromAirtableObject,
  hydrateToAirtableObject,
  prefixFor,
} = buildTranslationsUtils({ locales, fields, prefix, idField });