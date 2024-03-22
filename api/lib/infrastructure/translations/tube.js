import { buildTranslationsUtils } from './utils.js';

export const prefix = 'tube.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Titre pratique', field: 'practicalTitle' },
  { airtableField: 'Description pratique', field: 'practicalDescription' },
];

const idField = 'fields.id persistant';

const tubeTranslationUtils = buildTranslationsUtils({ locales, fields, prefix, idField });

export const {
  extractFromProxyObject,
  extractFromReleaseObject,
  airtableObjectToProxyObject,
  proxyObjectToAirtableObject,
  prefixFor,
  toDomain,
} = tubeTranslationUtils;
