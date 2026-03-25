import { Translation } from '../../domain/models/index.js';

function buildLocalizedFields(locales, fields) {
  return locales.flatMap((locale) =>
    fields.map((field) => ({
      locale: locale.locale,
      field: field.field,
      airtableField: `${field.airtableField} ${locale.airtableLocale}`,
    })),
  );
}

function toDomain({ fields, locales }) {
  return (translations) => {
    return Object.fromEntries(
      fields.map(({ field }) => [
        `${field}_i18n`,
        Object.fromEntries([
          ...locales.map(({ locale }) => [locale, null]),
          ...translations
            .filter((translation) => translation.key.endsWith(`.${field}`))
            .map((translation) => [translation.locale, translation.value]),
        ]),
      ]),
    );
  };
}

function extractFromDomainObject({ localizedFields, prefix }) {
  return (entity) => {
    return localizedFields
      .filter(({ field, locale }) => entity?.[`${field}_i18n`][locale])
      .map(
        ({ field, locale }) =>
          new Translation({
            key: `${prefix}${entity.id}.${field}`,
            value: entity[`${field}_i18n`][locale],
            locale,
          }),
      );
  };
}

function extractFromReleaseObject({ localizedFields, prefix }) {
  return (entity, locales) => {
    return localizedFields
      .filter(({ field, locale }) => (
        (locales === undefined || locales.includes(locale))
        && entity[`${field}_i18n`][locale]
      ))
      .map(
        ({ field, locale }) =>
          new Translation({
            key: `${prefix}${entity.id}.${field}`,
            value: entity[`${field}_i18n`][locale],
            locale,
          }),
      );
  };
}

export function buildTranslationsUtils({ locales, fields, prefix }) {
  const localizedFields = buildLocalizedFields(locales, fields);
  return {
    toDomain: toDomain({ fields, locales }),
    extractFromDomainObject: extractFromDomainObject({
      localizedFields,
      prefix,
    }),
    extractFromReleaseObject: extractFromReleaseObject({
      localizedFields,
      prefix,
    }),
  };
}
