import {
  areaTransformer,
  competenceTransformer,
  createChallengeTransformer,
  frameworkTransformer,
  skillTransformer,
  thematicTransformer,
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

/**
 * @typedef {import('../../../lib/domain/models').Area} Area
 * @typedef {import('../../../lib/domain/models').Attachment} Attachment
 * @typedef {import('../../../lib/domain/models').Competence} Competence
 * @typedef {import('../../../lib/domain/models').Framework} Framework
 * @typedef {import('../../../lib/domain/models').Skill} Skill
 * @typedef {import('../../../lib/domain/models').Thematic} Thematic
 * @typedef {import('../../../lib/domain/models').Tube} Tube
 * @typedef {import('../../../lib/domain/models').Tutorial} Tutorial
 **/

const logger = child('updatePixApiReleaseCacheService', { event: 'lcms:patch-release' });

/**
 * @param {Attachment} attachment
 */
export async function onAttachmentCreated(attachment) {
  await onAttachmentCreatedOrDeleted(attachment);
}

/**
 * @param {Attachment} _
 */
export async function onAttachmentUpdated(_) {
  // do nothing cause fields allowed to be updated in attachment are not exposed in release
}

/**
 * @param {Attachment} attachment
 */
export async function onAttachmentDeleted(attachment) {
  await onAttachmentCreatedOrDeleted(attachment);
}

/**
 * @param {Attachment} attachment
 */
async function onAttachmentCreatedOrDeleted(attachment) {
  if (!pixApiClient.isPixApiCachePatchingEnabled()) return;
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

/**
 * @param {Framework} framework
 */
export async function onFrameworkCreated(framework) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    try {
      await updatedRecordNotifier.notify({
        pixApiClient,
        model: 'frameworks',
        updatedRecord: frameworkTransformer.forRelease(framework),
      });
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
    }
  }
}

/**
 * @param {Area} area
 */
export async function onAreaCreated(area) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    try {
      await updatedRecordNotifier.notify({
        pixApiClient,
        model: 'areas',
        updatedRecord: areaTransformer.forRelease(area),
      });
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
    }
  }
}

/**
 * @param {Competence} competence
 */
export async function onCompetenceCreated(competence) {
  await onCompetenceCreatedOrUpdated(competence);
}

/**
 @param {Competence} competence
 */
export async function onCompetenceUpdated(competence) {
  await onCompetenceCreatedOrUpdated(competence);
}

/**
 * @param {Competence} competence
 */
async function onCompetenceCreatedOrUpdated(competence) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    try {
      await updatedRecordNotifier.notify({
        pixApiClient,
        model: 'competences',
        updatedRecord: competenceTransformer.forRelease(competence),
      });
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
    }
  }
}

/**
 * @param {Skill} skill
 */
export async function onSkillCreated(skill) {
  await onSkillCreatedOrUpdated(skill);
}

/**
 @param {Skill} skill
 */
export async function onSkillUpdated(skill) {
  await onSkillCreatedOrUpdated(skill);
}

/**
 * @param {Skill} skill
 */
async function onSkillCreatedOrUpdated(skill) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    try {
      await updatedRecordNotifier.notify({
        pixApiClient,
        model: 'skills',
        updatedRecord: skillTransformer.forRelease(skill),
      });
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
    }
  }
}

/**
 * @param {Thematic} thematic
 */
export async function onThematicCreated(thematic) {
  await onThematicCreatedOrUpdated(thematic);
}

/**
 @param {Thematic} thematic
 */
export async function onThematicUpdated(thematic) {
  await onThematicCreatedOrUpdated(thematic);
}

/**
 * @param {Thematic} thematic
 */
async function onThematicCreatedOrUpdated(thematic) {
  if (pixApiClient.isPixApiCachePatchingEnabled()) {
    try {
      await updatedRecordNotifier.notify({
        pixApiClient,
        model: 'thematics',
        updatedRecord: thematicTransformer.forRelease(thematic),
      });
    } catch (err) {
      logger.error(err);
      Sentry.captureException(err);
    }
  }
}

/**
 * @param {Tutorial} tutorial
 */
export async function onTutorialCreated(tutorial) {
  await onTutorialCreatedOrUpdated(tutorial);
}

/**
 * @param {Tutorial} tutorial
 */
export async function onTutorialUpdated(tutorial) {
  await onTutorialCreatedOrUpdated(tutorial);
}

/**
 * @param {Tutorial} tutorial
 */
async function onTutorialCreatedOrUpdated(tutorial) {
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
 * @param {Tube} tube
 */
export async function onTubeCreated(tube) {
  if (!pixApiClient.isPixApiCachePatchingEnabled()) return;
  try {
    const thematic = await thematicRepository.getByAirtableId(tube.thematicAirtableId);
    await updatedRecordNotifier.notify({
      model: 'tubes',
      updatedRecord: tubeTransformer.forRelease(tube, thematic, []),
      pixApiClient,
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}

/**
 * @param {Tube} tube
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
