import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import * as thematicsTranslations from '../../lib/infrastructure/translations/thematic.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateThematicsTranslationsFromAirtable({ airtableClient }) {
  const thematics = await airtableClient
    .table('Thematiques')
    .select({
      fields: [
        'id persistant',
        'Nom',
        'Titre en-us',
      ],
    })
    .all();

  const translations = thematics.flatMap((thematic) =>
    thematicsTranslations.extractFromProxyObject(thematic)
  );

  await translationRepository.save({ translations });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateThematicsTranslationsFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
