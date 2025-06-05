import {
  createChallengeTransformer,
  tubeTransformer,
  tutorialTransformer,
} from '../../infrastructure/transformers/index.js';
import {
  attachmentRepository,
  challengeRepository,
  localizedChallengeRepository,
  thematicRepository,
} from '../../infrastructure/repositories/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { child } from '../../infrastructure/logger.js';
import * as Sentry from '@sentry/node';

const logger = child('updatePixApiReleaseCacheService', { event: 'lcms:patch-release' });

export async function onAttachmentCreated({ attachment }) {
  await onAttachmentCreatedOrDeleted({ attachment });
}

export async function onAttachmentUpdated({ attachment: _ }) {
  // do nothing cause fields allowed to be updated in attachment are not exposed in release
}

export async function onAttachmentDeleted({ attachment }) {
  await onAttachmentCreatedOrDeleted({ attachment });
}

async function onAttachmentCreatedOrDeleted({ attachment }) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
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
}

export async function onTutorialCreated({ tutorial }) {
  await onTutorialCreatedOrUpdated({ tutorial });
}

export async function onTutorialUpdated({ tutorial }) {
  await onTutorialCreatedOrUpdated({ tutorial });
}

async function onTutorialCreatedOrUpdated({ tutorial }) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    try {
      const [tutorialForRelease] = tutorialTransformer.filterTutorialsFields([tutorial]);
      await updatedRecordNotifier.notify({
        pixApiClient,
        model: 'tutorials',
        updatedRecord: tutorialForRelease,
      });
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
    }
  }
}

/**
 * @param {import('../models'.Tube)} tube
 * @param {string} thematicAirtableId
 */
export async function onTubeCreated(tube, thematicId) {
  if (!pixApiClient.isPixApiCachePatchingEnabled()) return;
  try {
    await updatedRecordNotifier.notify({
      model: 'tubes',
      updatedRecord: tubeTransformer.transformTube(tube, thematicId),
      pixApiClient,
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}

/**
 * @param {import('../models'.Tube} tube
 */
export async function onTubeUpdated(tube) {
  if (!pixApiClient.isPixApiCachePatchingEnabled()) return;

  try {
    const [thematic, challenges] = await Promise.all([
      thematicRepository.getByAirtableId(tube.thematicAirtableId),
      challengeRepository.listValidPrototypesBySkillIds(tube.skillIds),
    ]);

    await updatedRecordNotifier.notify({
      model: 'tubes',
      updatedRecord: tubeTransformer.transformTube(tube, thematic.id, challenges),
      pixApiClient,
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}
