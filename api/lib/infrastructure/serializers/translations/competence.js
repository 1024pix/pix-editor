module.exports = {
  serialize(competence) {
    const translations = [];
    const id = competence['id persistant'];
    const locales = [
      { airtableLocale: 'fr-fr', locale: 'fr' },
      { airtableLocale: 'en-us', locale: 'en' },
    ];
    const competenceFields = [
      { airtableField: 'Titre', field: 'title' },
      { airtableField: 'Description', field: 'description' }
    ];
    locales.forEach(({ airtableLocale, locale }) => {
      competenceFields.forEach(({ airtableField, field }) => {
        if (competence[`${airtableField} ${airtableLocale}`]) {
          translations.push({
            key: `competence.${id}.${field}`,
            value: competence[`${airtableField} ${airtableLocale}`],
            locale
          });
        }
      });
    });
    return translations;
  }
};
