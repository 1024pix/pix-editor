import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import _ from 'lodash';
import * as challengeTranslations from '../../lib/infrastructure/translations/challenge.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';
import { challengeDatasource } from '../../lib/infrastructure/datasources/airtable/index.js';
import { Challenge } from '../../lib/domain/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateChallengesTranslationFromAirtable({ airtableClient }) {
  const allChallenges = await airtableClient
    .table('Epreuves')
    .select({
      fields: [
        'id persistant',
        'Consigne',
        'Consigne alternative',
        'Propositions',
        'Bonnes réponses',
        'Bonnes réponses à afficher',
      ],
    })
    .all();

  const translations = allChallenges.flatMap((challenge) => {
    const challengeModel = new Challenge(challengeDatasource.fromAirTableObject(challenge));
    return challengeTranslations.extractFromChallenge(challengeModel);
  });

  for (const translationsChunk of _.chunk(translations, 5000)) {
    await translationRepository.save(translationsChunk);
  }
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateChallengesTranslationFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
