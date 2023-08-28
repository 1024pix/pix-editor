const prefix = 'competence.';

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

module.exports = {
  extractFromAirtableObject(competence) {
    return Array.from(translationsExtractor(competence));
  },
  hydrateToAirtableObject(competence, translations) {
    const id = competence['id persistant'];

    for (const {
      airtableLocale,
      locale,
      airtableField,
      field,
    } of localizedFields) {
      const translation = translations.find(
        (translation) =>
          translation.key === `${prefix}${id}.${field}` &&
          translation.locale === locale
      );

      competence[`${airtableField} ${airtableLocale}`] =
        translation?.value ?? null;
    }
  },
  dehydrateAirtableObject(competence) {
    for (const {
      airtableLocale,
      airtableField,
    } of localizedFields) {
      delete competence[`${airtableField} ${airtableLocale}`];
    }
  },
  hydrateReleaseObject(competence, translations) {
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
  },
  prefix,
};

function* translationsExtractor(competence) {
  const id = competence['id persistant'];

  for (const {
    airtableLocale,
    locale,
    airtableField,
    field,
  } of localizedFields) {
    if (!competence[`${airtableField} ${airtableLocale}`]) continue;

    yield {
      key: `${prefix}${id}.${field}`,
      value: competence[`${airtableField} ${airtableLocale}`],
      locale,
    };
  }
}
