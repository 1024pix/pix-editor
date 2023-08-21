module.exports = {
  serialize(competence) {
    const translations = [];
    const id = competence['id persistant'];
    const locales = [
      { airtable: 'fr-fr', locale: 'fr' },
      { airtable: 'en-us', locale: 'en' },
    ];
    locales.forEach(({ airtable, locale }) => {
      if (competence[`Titre ${airtable}`]) {
        translations.push({
          key: `competence.${id}.title`,
          value: competence[`Titre ${airtable}`],
          lang: locale
        });
      }
    });
    return translations;
  }
};
