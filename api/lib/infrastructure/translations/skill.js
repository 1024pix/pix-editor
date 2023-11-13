import { Translation } from '../../domain/models/index.js';

export const prefix = 'skill.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Indice', field: 'hint' },
];

const localizedFields = locales.flatMap((locale) =>
  fields.map((field) => ({
    ...locale,
    ...field,
  }))
);

export function extractFromAirtableObject(skill) {
  return localizedFields
    .filter(({ airtableField, airtableLocale }) => skill[`${airtableField} ${airtableLocale}`])
    .map(({ field, locale, airtableField, airtableLocale }) => new Translation({
      key: `${prefixFor(skill)}${field}`,
      value: skill[`${airtableField} ${airtableLocale}`],
      locale,
    }));
}

export function hydrateToAirtableObject(skill, translations) {
  for (const {
    airtableLocale,
    locale,
    airtableField,
    field,
  } of localizedFields) {
    const translation = translations.find(
      (translation) =>
        translation.key === `${prefixFor(skill)}${field}` &&
        translation.locale === locale
    );

    skill[`${airtableField} ${airtableLocale}`] =
      translation?.value ?? null;
  }
}

export function dehydrateAirtableObject() {
}

export function hydrateReleaseObject() {
}

export function prefixFor(skill) {
  const id = skill['id persistant'];
  return `${prefix}${id}.`;
}

export function extractFromReleaseObject() {
}
