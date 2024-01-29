import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import * as areaTranslations from '../../lib/infrastructure/translations/area.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateAreasTranslationsFromAirtable({ airtableClient }) {
  const areas = await airtableClient
    .table('Domaines')
    .select({
      fields: [
        'id persistant',
        'Titre fr-fr',
        'Titre en-us',
      ],
    })
    .all();

  const translations = areas.flatMap((area) =>
    areaTranslations.extractFromProxyObject(area.fields)
  );

  await translationRepository.save({ translations });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateAreasTranslationsFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
