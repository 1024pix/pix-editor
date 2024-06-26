import 'dotenv/config';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { challengeRepository, releaseRepository } from '../../lib/infrastructure/repositories/index.js';
import _ from 'lodash';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function revertObsoleteChallengesToOriginalStatus({ dryRun, scriptExectIdToFix, releaseId }) {
  const challengeIds = await _getObsoleteChallengeIds({ scriptExectIdToFix });
  logger.info(`${challengeIds.length} épreuves récupérées et à traiter.`);
  const release = await releaseRepository.getRelease(releaseId);
  const challengeForReleaseByIds = _.keyBy(release.content.challenges, 'id');
  let updateCount = 0;

  for (const [index, challengeId] of challengeIds.entries()) {
    const challengeForRelease = challengeForReleaseByIds[challengeId];
    if (!challengeForRelease) {
      logger.warn(`(${index}/${challengeIds.length}) L'épreuve ${challengeId} n'a pas été trouvée dans la release.`);
      continue;
    }
    if (_hasAttachment(challengeForRelease)) {
      logger.warn(`(${index}/${challengeIds.length}) L'épreuve ${challengeId} a un attachment et ne doit donc pas être traité.`);
      continue;
    }
    const currentChallenge = await challengeRepository.get(challengeId);
    const previousStatus = currentChallenge.status;
    currentChallenge.status = challengeForRelease.status;
    currentChallenge.madeObsoleteAt = null;
    logger.info(`(${index}/${challengeIds.length}) L'épreuve ${challengeId} va être passée du statut "${previousStatus}" au statut "${currentChallenge.status}"`);
    ++updateCount;
    if (!dryRun) {
      await challengeRepository.update(currentChallenge);
    }
  }

  logger.info(`${updateCount} épreuves ont été rétablies.`);
}

function _hasAttachment(challengeForRelease) {
  return challengeForRelease.illustrationUrl || challengeForRelease.attachments?.length > 0;
}

async function _getObsoleteChallengeIds({ scriptExectIdToFix }) {
  return knex('focus_phrase')
    .pluck('persistantId')
    .where({ scriptExectId: scriptExectIdToFix, type: 'challenge' });
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const dryRun = process.env.DRY_RUN !== 'false';
  const scriptExectIdToFix = process.env.SCRIPT_ID;
  const releaseId = process.env.RELEASE_ID;

  if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');
  await revertObsoleteChallengesToOriginalStatus({ dryRun, scriptExectIdToFix, releaseId });
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
