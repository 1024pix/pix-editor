import * as translationUtils from './utils.js';

export const prefix = 'competence.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Titre', field: 'name' },
  { airtableField: 'Description', field: 'description' },
];

const localizedFields = translationUtils.buildLocalizedFields(locales, fields);

export const extractFromAirtableObject = translationUtils.extractFromAirtableObject({ localizedFields, prefix });

export const hydrateToAirtableObject = translationUtils.hydrateToAirtableObject({ localizedFields, prefix });

export const dehydrateAirtableObject = translationUtils.dehydrateAirtableObject({ localizedFields });

export const hydrateReleaseObject = translationUtils.hydrateReleaseObject({ fields, locales, prefix });

export const extractFromReleaseObject = translationUtils.extractFromReleaseObject({ localizedFields, prefix });

export const prefixFor = translationUtils.prefixFor({ prefix, idField: 'id persistant' });
