import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { knex } from '../db/knex-database-connection.js';

export class UpdateValidateToQualityOkChallenges extends Script {
  constructor() {
    super({
      description: 'Script de reprise des données des épreuves à statut validé à J+15',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not persist any deletion made during the script.',
          demandOption: false,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun }, 'Script updateValidateToQualityOkChallenges has started');
    const date = new Date();
    date.setDate(date.getDate() - 15);

    await knex.transaction(
      async (transaction) => {
        const changedChallenges = await transaction
          .update({ isQualityOk: true })
          .from('challenges')
          .where('status', 'validé')
          .where('validatedAt', '<=', date);

        if (options.dryRun) await transaction.rollback();

        if (changedChallenges === 0) {
          logger.info('No validated challenges status changed');
        } else {
          logger.info({ changedChallenges }, `${changedChallenges} challenges' status updated to 'Qualité validée'`);
        }
      },
    );
  }
}

await ScriptRunner.execute(import.meta.url, UpdateValidateToQualityOkChallenges);
