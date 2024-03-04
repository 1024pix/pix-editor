import dotenv from 'dotenv';
dotenv.config();
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

import { knex, disconnect } from '../../db/knex-database-connection.js';
import * as airtable from '../../lib/infrastructure/airtable.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { getCountryCode } from '../../lib/domain/models/Geography.js';

export async function migrateLocalizedChallengesGeography({ dryRun } = {}) {
  const challenges = await airtable.findRecords('Epreuves', {
    fields: ['id persistant', 'Géographie'],
    filterByFormula: 'AND({Géographie} != \'\', {Géographie} != \'Neutre\', {Géographie} != \'Institutions internationales\')',
  });

  for (const challenge of challenges) {
    const challengeId = challenge.get('id persistant');
    const countryName =  challenge.get('Géographie');

    const countryCode = getCountryCode(countryName);
    if (!countryCode) {
      logger.error({ challengeId }, `could not find country code for name "${countryName}"`);
      continue;
    }

    if (dryRun) continue;

    await knex('localized_challenges')
      .where({ id:challengeId })
      .update({ geography: countryCode });
  }
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);

  const dryRun = process.env.DRY_RUN !== 'false';

  if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');

  await migrateLocalizedChallengesGeography({ dryRun });

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

if (isLaunchedFromCommandLine) {
  main().catch((error) => {
    logger.error(error);
    process.exitCode = 1;
  }).finally(async () => {
    await disconnect();
  });
}
