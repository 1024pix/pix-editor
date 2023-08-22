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
      key: `competence.${id}.${field}`,
      value: competence[`${airtableField} ${airtableLocale}`],
      locale,
    };
  }
}
