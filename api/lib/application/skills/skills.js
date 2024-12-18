import {
  attachmentRepository,
  challengeRepository,
  skillRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';

import { generateNewId } from '../../infrastructure/utils/id-generator.js';
import { cloneSkill, getSkillChallengesProduction } from '../../domain/usecases/index.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';
import { challengeSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

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
    return h.response(err).code(400);
  }
}

export async function getProductionChallenges(request, h) {
  try {
    const skillId = request.params.skillId;
    const challenges = await getSkillChallengesProduction({
      skillId,
      dependencies: {
        challengeRepository,
        logger,
      },
    });
    return h.response(challengeSerializer.serialize(challenges));
  } catch (err) {
    console.log(err);
    throw err;
  }
}
