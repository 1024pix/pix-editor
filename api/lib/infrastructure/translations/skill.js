import * as translationUtils from './utils.js';

export const prefix = 'skill.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Indice', field: 'hint' },
];

const localizedFields = translationUtils.buildLocalizedFields(locales, fields);

export const extractFromAirtableObject = translationUtils.extractFromAirtableObject({ localizedFields, prefix });

export const hydrateToAirtableObject = translationUtils.hydrateToAirtableObject({ localizedFields, prefix });

export const prefixFor = translationUtils.prefixFor({ prefix, idField: 'id persistant' });

