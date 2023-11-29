import { buildTranslationsUtils } from './utils.js';

export const prefix = 'competence.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Titre', field: 'name' },
  { airtableField: 'Description', field: 'description' },
];

const idField = 'id persistant';

export const {
  extractFromProxyObject,
  airtableObjectToProxyObject,
  proxyObjectToAirtableObject,
  hydrateReleaseObject,
  extractFromReleaseObject,
  prefixFor,
} = buildTranslationsUtils({ locales, fields, prefix, idField });
