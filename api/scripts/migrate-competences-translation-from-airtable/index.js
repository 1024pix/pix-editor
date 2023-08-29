const Airtable = require('airtable');
const competenceTranslations = require('../../lib/infrastructure/translations/competence');
const translationsRepository = require('../../lib/infrastructure/repositories/translation-repository');
const { disconnect } = require('../../db/knex-database-connection');

async function migrateCompetencesTranslationFromAirtable({ airtableClient }) {
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
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateCompetencesTranslationFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();

module.exports = {
  migrateCompetencesTranslationFromAirtable,
};
