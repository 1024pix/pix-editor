import { createChallengeTransformer } from '../../infrastructure/transformers/index.js';
import {
  attachmentRepository,
  challengeRepository,
  localizedChallengeRepository
} from '../../infrastructure/repositories/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { child } from '../../infrastructure/logger.js';
import * as Sentry from '@sentry/node';

const logger = child('updatePixApiReleaseCacheService', { event: 'lcms:patch-release' });

export async function onAttachmentCreated({ attachment }) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    await onAttachmentCreatedOrDeleted({ attachment });
  }
}

export async function onAttachmentUpdated({ attachment: _ }) {
  // do nothing cause fields allowed to be updated in attachment are not exposed in release
}

export async function onAttachmentDeleted({ attachment }) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    await onAttachmentCreatedOrDeleted({ attachment });
  }
}

async function onAttachmentCreatedOrDeleted({ attachment }) {
  try {
    const localizedChallengeId = attachment.challengeId ?? attachment.localizedChallengeId;
    const localizedChallenge = await localizedChallengeRepository.get({ id: localizedChallengeId });
    const primaryChallenge = await challengeRepository.get(localizedChallenge.challengeId);
    const allChallengeAttachments = await attachmentRepository.listByLocalizedChallengeIds([localizedChallengeId]);
    const challengeToTransform = localizedChallenge.isPrimary ? primaryChallenge : primaryChallenge.translate(localizedChallenge.locale);
    const transformChallenge = createChallengeTransformer({ attachments: allChallengeAttachments });
    const transformedChallenge = transformChallenge(challengeToTransform);
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'challenges',
      updatedRecord: transformedChallenge,
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}
