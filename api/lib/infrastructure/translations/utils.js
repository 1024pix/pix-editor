import { Translation } from '../../domain/models/index.js';

function buildLocalizedFields(locales, fields) {
  return locales.flatMap((locale) =>
    fields.map((field) => ({
      locale: locale.locale,
      field: field.field,
      airtableField: `${field.airtableField} ${locale.airtableLocale}`,
    }))
  );
}

function extractFromProxyObject({ localizedFields, prefixFor }) {
  return (entity) => {
    return localizedFields
      .filter(({ airtableField }) => entity.fields[airtableField])
      .map(({ field, locale, airtableField }) => new Translation({
        key: `${prefixFor(entity)}${field}`,
        value: entity.fields[airtableField],
        locale,
      }));
  };
}

function airtableObjectToProxyObject({ localizedFields, prefixFor }) {
  return (airtableObject, translations) => {
    return {
      ...airtableObject,
      fields: {
        ...airtableObject.fields,
        ...Object.fromEntries(
          localizedFields.map(({ locale, airtableField, field }) => {
            const translation = translations.find(
              (translation) =>
                translation.key === `${prefixFor(airtableObject)}${field}` &&
                translation.locale === locale
            );

            return [airtableField, translation?.value ?? null];
          }),
        ),
      },
    };
  };
}

function proxyObjectToAirtableObject({ localizedFields }) {
  const airtableLocalizedFields = localizedFields.map(({ airtableField }) => airtableField);

  return (proxyObject) => ({
    ...proxyObject,
    fields: Object.fromEntries(
      Object.entries(proxyObject.fields).filter(([field]) => !airtableLocalizedFields.includes(field)),
    ),
  });
}

function toDomain({ fields, locales }) {
  return (translations) => {
    return Object.fromEntries(fields.map(({ field }) => [
      `${field}_i18n`,
      Object.fromEntries([
        ...locales.map(({ locale }) => [locale, null]),
        ...translations
          .filter((translation) => translation.key.endsWith(`.${field}`))
          .map((translation) => [
            translation.locale,
            translation.value
          ]),
      ]),
    ]));
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
    const id = idField.split('.').reduce((obj, key) => obj[key], entity);
    return `${prefix}${id}.`;
  };
}

export function buildTranslationsUtils({
  locales,
  fields,
  localizedFields = buildLocalizedFields(locales, fields),
  prefix,
  idField,
}) {
  const prefixFor = makePrefixFor({ prefix, idField });

  return {
    localizedFields,
    prefixFor,
    extractFromProxyObject: extractFromProxyObject({ localizedFields, prefixFor }),
    airtableObjectToProxyObject: airtableObjectToProxyObject({ localizedFields, prefixFor }),
    proxyObjectToAirtableObject: proxyObjectToAirtableObject({ localizedFields }),
    toDomain: toDomain({ fields, locales }),
    extractFromReleaseObject: extractFromReleaseObject({ localizedFields, prefix }),
  };
}
