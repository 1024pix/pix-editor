import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { knex } from '../db/knex-database-connection.js';

export class CleanupChallengesTranslations extends Script {
  constructor() {
    super({
      description: 'Script de nettoyage des traductions orphelines des épreuves',
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

    await knex.transaction(
      async (transaction) => {
        const localizedChallenges = await transaction.select('challengeId', 'locale').from('localized_challenges');
        const challengeIdLocales = new Set(
          localizedChallenges.map(({ challengeId, locale }) => `${challengeId}-${locale}`),
        );
        const challengesTranslations = await transaction.select('*').from('translations').where('model', 'challenge');

        const orphanTranslations = challengesTranslations.filter(
          ({ entityId, locale }) => !challengeIdLocales.has(`${entityId}-${locale}`),
        );
        if (orphanTranslations.length === 0) {
          logger.info('No orphan translations detected');
        } else {
          logger.info({ orphanTranslations }, `Will delete ${orphanTranslations.length} orphan translations`);
        }

        if (options.dryRun) return;

        if (orphanTranslations.length !== 0) {
          logger.info('Deleting orphan translations from PG...');
          await Promise.all(
            orphanTranslations.map(({ key, locale }) => transaction('translations').where({ key, locale }).delete()),
          );
        }
      },
      { readOnly: options.dryRun },
    );
  }
}

await ScriptRunner.execute(import.meta.url, CleanupChallengesTranslations);
