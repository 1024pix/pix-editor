import dotenv from 'dotenv/config';

import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { extname } from 'node:path';

import _ from 'lodash';

import { knex, disconnect } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import * as airtable from '../../lib/infrastructure/airtable.js';

export async function fixAttachments({ dryRun }) {
  const [airtableAttachmentRecords, localizedChallenges, localizedChallengesAttachments] = await Promise.all([
    airtable.findRecords('Attachments', {}),
    knex('localized_challenges').select(),
    knex('localized_challenges-attachments').select()
  ]);

  const attachments = airtableAttachmentRecords.map((airtableAttachmentRecord) => ({
    id: airtableAttachmentRecord.id,
    ...airtableAttachmentRecord.fields,
  }));

  const attachmentsById = Object.fromEntries(attachments.map((attachment) =>[attachment.id, attachment]));

  const attachmentId2LocalizedChallengeId = Object.fromEntries(localizedChallengesAttachments.map(({ attachmentId, localizedChallengeId }) => [attachmentId, localizedChallengeId]));

  const localizedChallengesById = Object.fromEntries(localizedChallenges.map((localizedChallenge) => [localizedChallenge.id, localizedChallenge]));

  const relationsToDelete = [];
  const attachmentsToDelete = [];

  for (const attachment of attachments) {
    if (!attachment['challengeId persistant'] || attachment['challengeId persistant'].length === 0) {
      logger.error({ attachment }, 'attachment without challengeId persistant');
    }

    if (!attachment.localizedChallengeId || attachment.localizedChallengeId === '') {
      logger.error({ attachment }, 'attachment without localizedChallengeId');
    }

    if (attachment.localizedChallengeId !== attachmentId2LocalizedChallengeId[attachment.id]) {
      logger.error({ attachment, localizedChallengeId: attachmentId2LocalizedChallengeId[attachment.id] }, 'attachment localizedChallengeId inconsistency');
    }

    if (!localizedChallengesById[attachment.localizedChallengeId]) {
      logger.error({ attachment }, 'attachment on unknown localizedChallenge');
    }

    if (attachment.type === 'illustration') {
      if (!localizedChallengesById[attachment.localizedChallengeId].illustrations) {
        localizedChallengesById[attachment.localizedChallengeId].illustrations = [];
      }

      localizedChallengesById[attachment.localizedChallengeId].illustrations.push(attachment);
    } else {
      if (!localizedChallengesById[attachment.localizedChallengeId].attachments) {
        localizedChallengesById[attachment.localizedChallengeId].attachments = [];
      }

      localizedChallengesById[attachment.localizedChallengeId].attachments.push(attachment);
    }
  }

  for (const { attachmentId, localizedChallengeId } of localizedChallengesAttachments) {
    if (!attachmentsById[attachmentId]) {
      logger.error({ attachmentId, localizedChallengeId }, 'relation to unknown attachment');
      relationsToDelete.push({ attachmentId, localizedChallengeId });
    }

    if (!localizedChallengesById[localizedChallengeId]) {
      logger.error({ attachmentId, localizedChallengeId }, 'relation to unknown localizedChallenge');
    }
  }

  for (const localizedChallenge of localizedChallenges) {
    if (localizedChallenge.attachments) {
      const attachmentExtensions = Array.from(new Set(localizedChallenge.attachments.map(({ url }) => extname(url))));
      if (attachmentExtensions.length !== localizedChallenge.attachments.length) {
        logger.error({ localizedChallenge }, 'localizedChallenge with duplicate extensions');
      }

      localizedChallenge.attachments.sort(({ createdAt: createdAt1 }, { createdAt: createdAt2 }) => createdAt1.localeCompare(createdAt2));

      const attachmentsByExtension = _.groupBy(localizedChallenge.attachments, ({ url }) => extname(url));

      for (const attachments of Object.values(attachmentsByExtension)) {
        if (attachments.length === 1) continue;

        attachmentsToDelete.push(...attachments.slice(0, -1));
      }
    }

    if (localizedChallenge.illustrations && localizedChallenge.illustrations.length > 1) {
      localizedChallenge.illustrations.sort(({ createdAt: createdAt1 }, { createdAt: createdAt2 }) => createdAt1.localeCompare(createdAt2));

      logger.error({ localizedChallenge }, 'localizedChallenge with several illustrations');

      attachmentsToDelete.push(...localizedChallenge.illustrations.slice(0, -1));
    }
  }

  logger.warn({ relationsToDelete }, `will delete ${relationsToDelete.length} relations from localized_challenges-attachments`);
  logger.warn({ attachmentsToDelete }, `will delete ${attachmentsToDelete.length} attachments from Attachments`);

  if (dryRun) {
    logger.info('dry run mode: script will stop, use DRY_RUN=false to actually perform deletions');
    return;
  }

  for (const { attachmentId, localizedChallengeId } of relationsToDelete) {
    await knex('localized_challenges-attachments').where({ attachmentId, localizedChallengeId }).delete();
  }

  if (attachmentsToDelete.length > 0) {
    const recordsChunks = _.chunk(attachmentsToDelete, 10);
    for (const recordsChunk of recordsChunks) {
      await airtable.deleteRecords('Attachments', recordsChunk.map(({ id }) => id));
    }
  }

  for (const { id: attachmentId, localizedChallengeId } of attachmentsToDelete) {
    await knex('localized_challenges-attachments').where({ attachmentId, localizedChallengeId }).delete();
  }
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const dryRun = process.env.DRY_RUN !== 'false';
  await fixAttachments({ dryRun });
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

if (isLaunchedFromCommandLine) {
  main().catch((err) => {
    logger.error(err);
    process.exitCode = 1;
  }).finally(async () => {
    await disconnect();
  });
}
