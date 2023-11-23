import { Translation } from '../../domain/models/index.js';

function buildLocalizedFields(locales, fields) {
  return locales.flatMap((locale) =>
    fields.map((field) => ({
      ...locale,
      ...field,
    }))
  );
}

function extractFromAirtableObject({ localizedFields, prefixFor }) {
  return (entity) => {
    return localizedFields
      .filter(({ airtableField, airtableLocale }) => entity[`${airtableField} ${airtableLocale}`])
      .map(({ field, locale, airtableField, airtableLocale }) => new Translation({
        key: `${prefixFor(entity)}${field}`,
        value: entity[`${airtableField} ${airtableLocale}`],
        locale,
      }));
  };
}

function hydrateToAirtableObject({ localizedFields, prefixFor }) {
  return (entity, translations) => {
    for (const {
      airtableLocale,
      locale,
      airtableField,
      field,
    } of localizedFields) {
      const translation = translations.find(
        (translation) =>
          translation.key === `${prefixFor(entity)}${field}` &&
          translation.locale === locale
      );

      entity[`${airtableField} ${airtableLocale}`] =
        translation?.value ?? null;
    }
  };
}

function dehydrateAirtableObject({ localizedFields }) {
  return (entity) => {
    for (const {
      airtableLocale,
      airtableField,
    } of localizedFields) {
      delete entity[`${airtableField} ${airtableLocale}`];
    }
  };
}

function hydrateReleaseObject({ fields, locales, prefix }) {
  return (entity, translations) => {
    for (const { field } of fields) {
      entity[`${field}_i18n`] = {};
      for (const { locale } of locales) {
        const translation = translations.find(
          (translation) =>
            translation.key === `${prefix}${entity.id}.${field}` &&
            translation.locale === locale
        );
        entity[`${field}_i18n`][locale] = translation?.value ?? null;
      }
    }
  };
}

function extractFromReleaseObject({ localizedFields, prefix }) {
  return (entity) => {
    return localizedFields
      .filter(({ field, locale }) => entity[`${field}_i18n`][locale])
      .map(({ field, locale }) => new Translation({
        key: `${prefix}${entity.id}.${field}`,
        value: entity[`${field}_i18n`][locale],
        locale,
      }));
  };
}

function makePrefixFor({ prefix, idField }) {
  return (entity) => {
    const id = entity[idField];
    return `${prefix}${id}.`;
  };
}

export function buildTranslationsUtils({ locales, fields, prefix, idField }) {
  const localizedFields = buildLocalizedFields(locales, fields);
  const prefixFor = makePrefixFor({ prefix, idField });

  return {
    localizedFields,
    prefixFor,
    extractFromAirtableObject: extractFromAirtableObject({ localizedFields, prefixFor }),
    hydrateToAirtableObject: hydrateToAirtableObject({ localizedFields, prefixFor }),
    dehydrateAirtableObject: dehydrateAirtableObject({ localizedFields }),
    hydrateReleaseObject: hydrateReleaseObject({ fields, locales, prefix }),
    extractFromReleaseObject: extractFromReleaseObject({ localizedFields, prefix }),
  };
}
