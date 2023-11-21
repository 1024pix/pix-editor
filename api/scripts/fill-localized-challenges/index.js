import { localizedChallengeRepository } from '../../lib/infrastructure/repositories/index.js';
import { convertLanguagesToLocales } from '../../lib/domain/services/convert-locales.js';
import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import { disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;
export async function fillLocalizedChallenges({ airtableClient }) {
  const localizedChallenges = await fetchLocalizedChallenges({ airtableClient })
  await localizedChallengeRepository.create(...localizedChallenges);
}

export async function fetchLocalizedChallenges({ airtableClient }) {
  const allChallenges = await airtableClient
    .table('Epreuves')
    .select({
      fields: [
        'id persistant',
        'Langues',
      ],
    })
    .all();

  return allChallenges.map((challenge) => {
    const locale = convertLanguagesToLocales(challenge.get('Langues'))?.sort()?.[0] ?? 'fr';
    const idPersistant = challenge.get('id persistant');
    return {
      id: idPersistant,
      challengeId: idPersistant,
      locale,
    };
  });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await fillLocalizedChallenges({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
