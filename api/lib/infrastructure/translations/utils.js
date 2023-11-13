import { Translation } from '../../domain/models/index.js';

export function buildLocalizedFields(locales, fields) {
  return locales.flatMap((locale) =>
    fields.map((field) => ({
      ...locale,
      ...field,
    }))
  );
}

export function extractFromAirtableObject({ localizedFields, prefix }) {
  return (entity) => {
    return localizedFields
      .filter(({ airtableField, airtableLocale }) => entity[`${airtableField} ${airtableLocale}`])
      .map(({ field, locale, airtableField, airtableLocale }) => new Translation({
        key: `${buildPrefix(entity, prefix)}${field}`,
        value: entity[`${airtableField} ${airtableLocale}`],
        locale,
      }));
  };
}

export function hydrateToAirtableObject({ localizedFields, prefix }) {
  return (entity, translations) => {
    for (const {
      airtableLocale,
      locale,
      airtableField,
      field,
    } of localizedFields) {
      const translation = translations.find(
        (translation) =>
          translation.key === `${buildPrefix(entity, prefix)}${field}` &&
          translation.locale === locale
      );

      entity[`${airtableField} ${airtableLocale}`] =
        translation?.value ?? null;
    }
  };
}

export function dehydrateAirtableObject({ localizedFields }) {
  return (entity) => {
    for (const {
      airtableLocale,
      airtableField,
    } of localizedFields) {
      delete entity[`${airtableField} ${airtableLocale}`];
    }
  };
}

export function hydrateReleaseObject({ fields, locales, prefix }) {
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

export function extractFromReleaseObject({ localizedFields, prefix }) {
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

export function prefixFor({ prefix, idField }) {
  return (entity) => {
    const id = entity[idField];
    return `${prefix}${id}.`;
  };
}

