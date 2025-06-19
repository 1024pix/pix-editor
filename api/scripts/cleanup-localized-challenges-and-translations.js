import fp from 'lodash/fp.js';
import Airtable from 'airtable';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { knex } from '../db/knex-database-connection.js';
import { translationDatasource } from '../lib/infrastructure/datasources/airtable/index.js';

export class CleanupLocalizedChallengesAndTranslations extends Script {
  constructor() {
    super({
      description: 'Script de nettoyage des localized challenges et traductions orphelines',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not persist any deletion made during the script.',
          demandOption: true,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun }, 'Script cleanupLocalizedChallengesAndTranslations has started');

    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);
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

      if (options.dryRun) return;

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
    }, { readOnly: options.dryRun });
  }
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

await ScriptRunner.execute(import.meta.url, CleanupLocalizedChallengesAndTranslations);
