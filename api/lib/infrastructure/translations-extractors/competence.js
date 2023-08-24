const prefix = 'competence';

const locales = [
  { airtableLocale: 'fr-fr', locale: 'fr' },
  { airtableLocale: 'en-us', locale: 'en' },
];

const fields = [
  { airtableField: 'Titre', field: 'title' },
  { airtableField: 'Description', field: 'description' },
];

const localizedFields = locales.flatMap((locale) =>
  fields.map((field) => ({
    ...locale,
    ...field,
  }))
);

module.exports = {
  extractTranslations(competence) {
    return Array.from(translationsExtractor(competence));
  },
  hydrateTranslations(competence, translations) {
    const id = competence['id persistant'];

    for (const {
      airtableLocale,
      locale,
      airtableField,
      field,
    } of localizedFields) {
      const translation = translations.find(
        (translation) =>
          translation.key === `${prefix}.${id}.${field}` &&
          translation.locale === locale
      );

      competence[`${airtableField} ${airtableLocale}`] =
        translation?.value ?? null;
    }
  },
};

function* translationsExtractor(competence) {
  const id = competence['id persistant'];

  for (const {
    airtableLocale,
    locale,
    airtableField,
    field,
  } of localizedFields) {
    if (!competence[`${airtableField} ${airtableLocale}`]) return;

    yield {
      key: `${prefix}.${id}.${field}`,
      value: competence[`${airtableField} ${airtableLocale}`],
      locale,
    };
  }
}
