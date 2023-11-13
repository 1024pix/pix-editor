import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import * as skillTranslations from '../../lib/infrastructure/translations/skill.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateSkillsTranslationFromAirtable({ airtableClient }) {
  const allSkills = await airtableClient
    .table('Acquis')
    .select({
      fields: [
        'id persistant',
        'Indice fr-fr',
        'Indice en-us',
      ],
    })
    .all();

  const translations = allSkills.flatMap((skill) =>
    skillTranslations.extractFromAirtableObject(skill.fields)
  );

  await translationRepository.save(translations);
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateSkillsTranslationFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
