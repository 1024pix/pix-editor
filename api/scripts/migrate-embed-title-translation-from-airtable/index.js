import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import _ from 'lodash';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';
import { convertLanguagesToLocales } from '../../lib/domain/services/convert-locales.js';
import { prefixFor } from '../../lib/infrastructure/translations/challenge.js';
import { Challenge, Translation } from '../../lib/domain/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateEmbedTitleTranslationFromAirtable({ airtableClient }) {
  const allChallenges = await airtableClient
    .table('Epreuves')
    .select({
      fields: [
        'id persistant',
        'Embed title',
        'Langues',
      ],
    })
    .all();

  const translations = allChallenges.map((challenge) => {
    return {
      id: challenge.get('id persistant'),
      embedTitle: challenge.get('Embed title'),
      locales: convertLanguagesToLocales(challenge.get('Langues')),
    };
  }).filter((challenge) => {
    return challenge.embedTitle;
  }).map((challenge) => {
    return new Translation({
      key: `${prefixFor(challenge)}embedTitle`,
      locale: Challenge.getPrimaryLocale(challenge.locales),
      value: challenge.embedTitle,
    });
  });
  for (const translationsChunk of _.chunk(translations, 5000)) {
    await translationRepository.save({ translations: translationsChunk });
  }
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateEmbedTitleTranslationFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
