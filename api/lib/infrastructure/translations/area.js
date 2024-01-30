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

const areaTranslationUtils = buildTranslationsUtils({ locales, fields, prefix, idField });

export const {
  extractFromProxyObject,
  extractFromReleaseObject,
  prefixFor,
  toDomain,
} = areaTranslationUtils;

export function airtableObjectToProxyObject(airtableObject, translations) {
  const areaProxyObject = areaTranslationUtils.airtableObjectToProxyObject(airtableObject, translations);
  areaProxyObject.Nom = `${areaProxyObject.Code}. ${areaProxyObject['Titre fr-fr']}`;
  return areaProxyObject;
}
