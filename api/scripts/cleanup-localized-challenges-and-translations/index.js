import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import fp from 'lodash/fp.js';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { translationDatasource } from '../../lib/infrastructure/datasources/airtable/index.js';

export async function cleanupLocalizedChallengesAndTranslations({ airtableClient, dryRun = true }) {
  const challengeIds = await fetchChallengeIds({ airtableClient });

  await knex.transaction(async (transaction) => {
    const localizedChallenges = await transaction('localized_challenges').select('id', 'challengeId', 'locale');

    const orphanLocalizedChallenges = localizedChallenges.filter(({ challengeId }) => !challengeIds.has(challengeId));
    if (orphanLocalizedChallenges.length === 0) {
      logger.info('No orphan localized challenges detected');
    } else {
      logger.info({ orphanLocalizedChallenges }, `Will delete ${orphanLocalizedChallenges.length} orphan localized challenges`);
    }

    const challengesTranslations = await transaction('translations')
      .whereLike('key', 'challenge.%')
      .select('key', 'locale');

    const challengesLocales = fp.flow(
      fp.filter((localizedChallenge) => !orphanLocalizedChallenges.includes(localizedChallenge)),
      fp.groupBy('challengeId'),
      fp.mapValues(fp.map('locale')),
    )(localizedChallenges);

    const orphanTranslations = challengesTranslations.filter(({ key, locale }) => {
      const challengeId = key.split('.')[1];
      return !challengesLocales[challengeId]?.includes(locale);
    });
    if (orphanTranslations.length === 0) {
      logger.info('No orphan translations detected');
    } else {
      logger.info({ orphanTranslations }, `Will delete ${orphanTranslations.length} orphan translations`);
    }

    if (dryRun) return;

    if (orphanLocalizedChallenges.length !== 0) {
      logger.info('Deleting orphan localized challenges...');
      await transaction('localized_challenges').whereIn('id', orphanLocalizedChallenges.map(({ id }) => id)).delete();
    }

    if (orphanTranslations.length !== 0) {
      logger.info('Deleting orphan translations from PG...');
      await Promise.all(orphanTranslations.map(({ key, locale }) => transaction('translations').where({ key, locale }).delete()));

      if (await translationDatasource.exists()) {
        logger.info('Deleting orphan translations from Airtable...');
        const records = await translationDatasource.filter({
          filter: {
            formula: `OR(${orphanTranslations.map(({ key, locale }) => `AND(key = '${key}', locale = '${locale}')`).join(', ')})`,
          },
        });
        if (records.length === 0) return;
        const recordIds = records.map(({ airtableId }) => airtableId);
        for (const chunk of chunks(recordIds)) {
          logger.info({ recordIds: chunk }, 'Deleting record IDs...');
          await translationDatasource.delete(chunk);
        }
      }
    }
  }, { readOnly: dryRun });
}

export async function fetchChallengeIds({ airtableClient }) {
  const allChallenges = await airtableClient
    .table('Epreuves')
    .select({ fields: ['id persistant'] })
    .all();

  return new Set(allChallenges.map((challenge) => challenge.get('id persistant')));
}

function* chunks(array, size = 10) {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const dryRun = process.env.DRY_RUN !== 'false';

    logger.info({ dryRun }, 'Script cleanupLocalizedChallengesAndTranslations has started');

    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await cleanupLocalizedChallengesAndTranslations({ airtableClient, dryRun });
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
