import { convertLanguagesToLocales } from '../../lib/domain/services/convert-locales.js';
import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import { disconnect, knex } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;
export async function fillLocalizedChallenges({ airtableClient }) {
  const idealLocalizedChallenges = await fetchLocalizedChallenges({ airtableClient });
  const idealLocales = Object.fromEntries(idealLocalizedChallenges.map(({ id, locale }) => [id, locale]));

  await knex.transaction(async (transaction) => {
    const localizedChallenges = await transaction('localized_challenges').where('id', knex.raw('"challengeId"')).select();

    const brokenLocalizedChallenges = localizedChallenges.filter(({ id, locale }) => idealLocales[id] !== undefined && locale !== idealLocales[id]);

    if (brokenLocalizedChallenges.length === 0) {
      console.log('No localized challenges need to be fixed');
      return;
    }

    console.log(`Fixing ${brokenLocalizedChallenges.length} localized challenges`);
    brokenLocalizedChallenges.forEach(
      ({ id, locale }) => console.log(`  will change ${id} from ${locale} to ${idealLocales[id]}`),
    );

    await Promise.all(brokenLocalizedChallenges.map(
      ({ id }) => transaction('localized_challenges').where('id', id).update({ locale: idealLocales[id] }),
    ));
  });
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
