import { localizedChallengeRepository } from '../../lib/infrastructure/repositories/index.js';
import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import { knex, disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export function fillLocalizedChallengesEmbedUrl({ airtableClient }) {
  return knex.transaction(async (transaction) => {
    const localizedChallenges = await fetchLocalizedChallenges({ airtableClient });
    for (const localizedChallenge of localizedChallenges) {
      await localizedChallengeRepository.update({ localizedChallenge, transaction });
    }
  });
}

export async function fetchLocalizedChallenges({ airtableClient }) {
  const allChallenges = await airtableClient
    .table('Epreuves')
    .select({
      fields: [
        'id persistant',
        'Embed URL',
      ],
      filterByFormula: 'NOT({Embed URL} = \'\')',
    })
    .all();

  return allChallenges.map((challenge) => {
    const idPersistant = challenge.get('id persistant');
    const embedUrl = challenge.get('Embed URL');
    if (!embedUrl) {
      console.error(`Embed URL is empty ! (challenge id ${idPersistant})`);
    }
    return {
      id: idPersistant,
      embedUrl,
    };
  });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await fillLocalizedChallengesEmbedUrl({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
