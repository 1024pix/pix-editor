import { Translation } from '../../domain/models/index.js';

function buildLocalizedFields(locales, fields) {
  return locales.flatMap((locale) =>
    fields.map((field) => ({
      ...locale,
      ...field,
    }))
  );
}

function extractFromProxyObject({ localizedFields, prefixFor }) {
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

function airtableObjectToProxyObject({ localizedFields, prefixFor }) {
  return (airtableObject, translations) => {
    return {
      ...airtableObject,
      ...Object.fromEntries(
        localizedFields.map(({ airtableLocale, locale, airtableField, field }) => {
          const translation = translations.find(
            (translation) =>
              translation.key === `${prefixFor(airtableObject)}${field}` &&
              translation.locale === locale
          );

          return [`${airtableField} ${airtableLocale}`, translation?.value ?? null];
        }),
      ),
    };
  };
}

function proxyObjectToAirtableObject({ localizedFields }) {
  const airtableLocalizedFields = localizedFields
    .map(({ airtableLocale, airtableField }) => `${airtableField} ${airtableLocale}`);

  return (proxyObject) => Object.fromEntries(
    Object.entries(proxyObject).filter(([field]) => !airtableLocalizedFields.includes(field)),
  );
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
    extractFromProxyObject: extractFromProxyObject({ localizedFields, prefixFor }),
    airtableObjectToProxyObject: airtableObjectToProxyObject({ localizedFields, prefixFor }),
    proxyObjectToAirtableObject: proxyObjectToAirtableObject({ localizedFields }),
    hydrateReleaseObject: hydrateReleaseObject({ fields, locales, prefix }),
    extractFromReleaseObject: extractFromReleaseObject({ localizedFields, prefix }),
  };
}
