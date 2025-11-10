import Joi from 'joi';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { knex } from '../db/knex-database-connection.js';
import { csvFileParser } from '../lib/application/scripts/parsers.js';

export const csvSchemas = [
  { name: 'challenge_id', schema: Joi.string().trim().required() },
  { name: 'alpha', schema: Joi.number().required() },
  { name: 'delta', schema: Joi.number().required() },
];

export class PopulateAlphaAndDeltaColumnsWithCsv extends Script {
  constructor() {
    super({
      description: 'Script pour mettre à jour la calibration des épreuves (alpha et delta) depuis un fichier csv',
      permanent: true,
      options: {
        file: {
          type: 'string',
          describe:
            'CSV File with `challenge_id`, `alpha` and `delta` columns extracted from `datawarehouse.data_active_calibrated_challenges`',
          demandOption: true,
          coerce: csvFileParser(csvSchemas),
        },
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          demandOption: false,
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { file: challengeCalibrations, dryRun } = options;
    logger.debug(challengeCalibrations);

    const trx = await knex.transaction();
    try {
      let count = 0;
      await trx('challenges').update({ alpha: null, delta: null });
      for (const challengeCalibration of challengeCalibrations) {
        count += await trx('challenges')
          .update({ alpha: challengeCalibration.alpha, delta: challengeCalibration.delta })
          .where({ id: challengeCalibration.challenge_id });
      }
      if (dryRun) {
        await trx.rollback();
        logger.info(`Dry run: ${count} challenges would be updated`);
      }

      await trx.commit();
      logger.info(`Updated calibration of ${count} challenges`);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

await ScriptRunner.execute(import.meta.url, PopulateAlphaAndDeltaColumnsWithCsv);
