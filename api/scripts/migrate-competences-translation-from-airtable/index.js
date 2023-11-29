import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import * as competenceTranslations from '../../lib/infrastructure/translations/competence.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateCompetencesTranslationFromAirtable({ airtableClient }) {
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
    competenceTranslations.extractFromProxyObject(competence.fields)
  );

  await translationRepository.save(translations);
}

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
