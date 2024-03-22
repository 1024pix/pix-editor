import { buildTranslationsUtils } from './utils.js';

export const prefix = 'thematic.';

const locales = [
  { locale: 'fr' },
  { locale: 'en' },
];

const fields = [
  { field: 'name' },
];

const localizedFields = [
  {
    airtableField: 'Nom',
    field: 'name',
    locale: 'fr',
  },
  {
    airtableField: 'Titre en-us',
    field: 'name',
    locale: 'en',
  },
];

const idField = 'fields.id persistant';

const thematicTranslationUtils = buildTranslationsUtils({ locales, fields, localizedFields, prefix, idField });

export const {
  extractFromProxyObject,
  airtableObjectToProxyObject,
  extractFromReleaseObject,
  toDomain,
  prefixFor,
} = thematicTranslationUtils;
