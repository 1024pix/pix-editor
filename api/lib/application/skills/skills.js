import Boom from '@hapi/boom';

import {
  attachmentRepository,
  challengeRepository,
  skillRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import { generateNewId } from '../../infrastructure/utils/id-generator.js';
import { normalizeNonBreakingSpace } from '../../infrastructure/utils/normalize-non-breaking-space.js';
import {
  cloneSkill,
  createSkill,
  getSkillChallengesProduction,
  listSkills,
  updateSkill,
} from '../../domain/usecases/index.js';
import { NotFoundError } from '../../domain/errors.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';
import { challengeSerializer, skillSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { skillTransformer } from '../../infrastructure/transformers/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';

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
    return h.response().redirect(`/api/skills/${newSkill.airtableId}`);
  } catch (err) {
    logger.error(err);
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

export async function list(req) {
  const params = extractParameters(req.query);
  const skills = await listSkills(params);
  return skillSerializer.serialize(skills);
}

export async function get(req) {
  const skill = await skillRepository.getByAirtableId(req.params.skillAirtableId);
  if (!skill) throw new NotFoundError('unknown skill');
  return skillSerializer.serialize(skill);
}

export async function create(req, h) {
  const skill = await skillSerializer.deserialize(req.payload);
  const createdSkill = await createSkill(skill, {
    skillRepository,
    tubeRepository,
    skillTransformer,
    updatedRecordNotifier,
    pixApiClient,
    generateNewIdFnc: generateNewId,
    normalizeNonBreakingSpaceFnc: normalizeNonBreakingSpace,
  });
  return h.response(skillSerializer.serialize(createdSkill)).code(201);
}

export async function update(req, h) {
  const { attributes, relationships } = req.payload.data;
  const updateSkillCommand = {
    airtableId: req.params.skillAirtableId,
    description: attributes['description'],
    descriptionStatus: attributes['description-status'],
    clue: attributes['clue'],
    clueEn: attributes['clue-en'],
    clueStatus: attributes['clue-status'],
    i18n: attributes['i18n'],
    status: attributes['status'],
    tutoMoreAirtableIds: relationships['tuto-more'].data.map(({ id }) => id),
    tutoSolutionAirtableIds: relationships['tuto-solution'].data.map(({ id }) => id),
  };
  const updatedSkill = await updateSkill(updateSkillCommand, {
    skillRepository,
    skillTransformer,
    updatedRecordNotifier,
    pixApiClient,
    logger,
    normalizeNonBreakingSpaceFnc: normalizeNonBreakingSpace,
  });

  if (updatedSkill === null) return Boom.notFound();

  return h.response(skillSerializer.serialize(updatedSkill)).code(200);
}
