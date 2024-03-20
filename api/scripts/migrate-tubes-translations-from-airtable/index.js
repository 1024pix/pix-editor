import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import * as tubesTranslations from '../../lib/infrastructure/translations/tube.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateTubesTranslationsFromAirtable({ airtableClient }) {
  const tubes = await airtableClient
    .table('Tubes')
    .select({
      fields: [
        'id persistant',
        'Titre pratique fr-fr',
        'Titre pratique en-us',
        'Description pratique fr-fr',
        'Description pratique en-us',
      ],
    })
    .all();

  const translations = tubes.flatMap((tube) =>
    tubesTranslations.extractFromProxyObject(tube)
  );

  await translationRepository.save({ translations });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateTubesTranslationsFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
