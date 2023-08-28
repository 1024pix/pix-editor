const Airtable = require('airtable');
const competenceTranslations = require('../../lib/infrastructure/translations/competence');
const translationsRepository = require('../../lib/infrastructure/repositories/translation-repository');

async function main() {
  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    const allCompetences = await airtableClient
      .table('Competences')
      .select({
        fields: [
          'id persistant',
          'Titre fr-fr',
          'Titre en-us',
          'Description fr-fr',
          'Description en-us',
        ],
      })
      .all();

    const translations = allCompetences.flatMap((competence) =>
      competenceTranslations.extractFromAirtableObject(competence.fields)
    );

    await translationsRepository.save(translations);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  main,
};
