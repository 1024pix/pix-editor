import * as Sentry from '@sentry/node';
import Boom from '@hapi/boom';

import {
  attachmentRepository,
  challengeRepository,
  skillRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import { generateNewId } from '../../infrastructure/utils/id-generator.js';
import {
  cloneSkill,
  getSkillChallengesProduction,
  getSkillLocalizedChallengesProduction
} from '../../domain/usecases/index.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';
import { challengeSerializer, localizedChallengeSerializer, skillSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export async function clone(request, h) {
  try {
    const newSkill = await cloneSkill({
      cloneCommand: request.payload.data.attributes,
      dependencies: {
        skillRepository,
        challengeRepository,
        tubeRepository,
        attachmentRepository,
        generateNewIdFnc: generateNewId,
        pixApiClient,
        updatedRecordNotifier,
      },
    });
    return h.response().redirect(`/api/airtable/content/Acquis/${newSkill.airtableId}`);
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
    return h.response(err).code(400);
  }
}

export async function getProductionChallenges(request, h) {
  const skillId = request.params.skillId;
  const challenges = await getSkillChallengesProduction({
    skillId,
    dependencies: {
      challengeRepository,
      logger,
    },
  });
  return h.response(challengeSerializer.serialize(challenges));
}

export async function getProductionLocalizedChallenges(request, h) {
  const skillId = request.params.skillId;
  const localizedChallenges = await getSkillLocalizedChallengesProduction({
    skillId,
    dependencies: {
      challengeRepository,
      logger,
    },
  });
  return h.response(localizedChallengeSerializer.serializeRead(localizedChallenges));
}

export async function list() {
  try {
    const skills = await skillRepository.list();
    return skillSerializer.serialize(skills);
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
    return Boom.internal(err);
  }
}
