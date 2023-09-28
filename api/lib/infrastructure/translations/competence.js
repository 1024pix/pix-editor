import { Translation } from '../../domain/models/index.js';

export const prefix = 'competence.';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Titre', field: 'name' },
  { airtableField: 'Description', field: 'description' },
];

const localizedFields = locales.flatMap((locale) =>
  fields.map((field) => ({
    ...locale,
    ...field,
  }))
);

export function extractFromAirtableObject(competence) {
  return localizedFields
    .filter(({ airtableField, airtableLocale }) => competence[`${airtableField} ${airtableLocale}`])
    .map(({ field, locale, airtableField, airtableLocale }) => new Translation({
      key: `${prefixFor(competence)}${field}`,
      value: competence[`${airtableField} ${airtableLocale}`],
      locale,
    }));
}

export function hydrateToAirtableObject(competence, translations) {
  for (const {
    airtableLocale,
    locale,
    airtableField,
    field,
  } of localizedFields) {
    const translation = translations.find(
      (translation) =>
        translation.key === `${prefixFor(competence)}${field}` &&
        translation.locale === locale
    );

    competence[`${airtableField} ${airtableLocale}`] =
      translation?.value ?? null;
  }
}

export function dehydrateAirtableObject(competence) {
  for (const {
    airtableLocale,
    airtableField,
  } of localizedFields) {
    delete competence[`${airtableField} ${airtableLocale}`];
  }
}

export function hydrateReleaseObject(competence, translations) {
  for (const { field } of fields) {
    competence[`${field}_i18n`] = {};
    for (const { locale } of locales) {
      const translation = translations.find(
        (translation) =>
          translation.key === `${prefix}${competence.id}.${field}` &&
          translation.locale === locale
      );
      competence[`${field}_i18n`][locale] = translation?.value ?? null;
    }
  }
}

export function prefixFor(competence) {
  const id = competence['id persistant'];
  return `${prefix}${id}.`;
}
