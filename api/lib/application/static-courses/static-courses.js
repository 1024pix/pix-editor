import _ from 'lodash';
import {
  localizedChallengeRepository,
  staticCourseRepository,
  staticCourseTagRepository
} from '../../infrastructure/repositories/index.js';
import { staticCourseSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import * as idGenerator from '../../infrastructure/utils/id-generator.js';
import { StaticCourse } from '../../domain/models/index.js';
import { NotFoundError } from '../../domain/errors.js';

export async function findSummaries(request, h) {
  const { filter, page } = request.query;
  const { results: staticCourseSummaries, meta } = await staticCourseRepository.findReadSummaries({ filter, page });
  return h.response(staticCourseSerializer.serializeSummary(staticCourseSummaries, meta));
}

export async function get(request, h) {
  const staticCourseId = request.params.id;
  const staticCourse = await staticCourseRepository.getRead(staticCourseId, { baseUrl: getBaseUrl(request) });
  return h.response(staticCourseSerializer.serialize(staticCourse));
}

export async function create(request, h) {
  const creationCommand = normalizeCreationOrUpdateCommand(request.payload.data.attributes);
  const localizedChallenges = await localizedChallengeRepository.getMany({ ids: creationCommand.challengeIds });
  const allTagIds = await staticCourseTagRepository.listIds();
  const commandResult = StaticCourse.buildFromCreationCommand({
    creationCommand,
    allChallengeIds: localizedChallenges.map(({ id }) => id),
    allTagIds,
    idGenerator: idGenerator.generateNewId,
  });
  if (commandResult.isFailure()) {
    throw commandResult.error;
  }
  const staticCourseId = await staticCourseRepository.save(commandResult.value);
  const staticCourseReadModel = await staticCourseRepository.getRead(staticCourseId, { baseUrl: getBaseUrl(request) });
  return h.response(staticCourseSerializer.serialize(staticCourseReadModel)).created();
}

export async function update(request, h) {
  const staticCourseId = request.params.id;
  const updateCommand = normalizeCreationOrUpdateCommand(request.payload.data.attributes);
  const staticCourseToUpdate = await staticCourseRepository.get(staticCourseId);
  if (!staticCourseToUpdate) {
    throw new NotFoundError(`Le test statique d'id ${staticCourseId} n'existe pas ou son accès restreint`);
  }
  const localizedChallenges = await localizedChallengeRepository.getMany({ ids: updateCommand.challengeIds });
  const allTagIds = await staticCourseTagRepository.listIds();
  const commandResult = staticCourseToUpdate.update({
    updateCommand,
    allChallengeIds: localizedChallenges.map(({ id }) => id),
    allTagIds,
  });
  if (commandResult.isFailure()) {
    throw commandResult.error;
  }
  await staticCourseRepository.save(commandResult.value);
  const staticCourseReadModel = await staticCourseRepository.getRead(staticCourseId, { baseUrl: getBaseUrl(request) });
  return h.response(staticCourseSerializer.serialize(staticCourseReadModel));
}

export async function deactivate(request, h) {
  const staticCourseId = request.params.id;
  const deactivationCommand = normalizeDeactivationCommand(request.payload.data.attributes);
  const staticCourseToUpdate = await staticCourseRepository.get(staticCourseId);
  if (!staticCourseToUpdate) {
    throw new NotFoundError(`Le test statique d'id ${staticCourseId} n'existe pas ou son accès restreint`);
  }
  const commandResult = staticCourseToUpdate.deactivate(deactivationCommand);
  if (commandResult.isFailure()) {
    throw commandResult.error;
  }
  await staticCourseRepository.save(commandResult.value);
  const staticCourseReadModel = await staticCourseRepository.getRead(staticCourseId, { baseUrl: getBaseUrl(request) });
  return h.response(staticCourseSerializer.serialize(staticCourseReadModel));
}

export async function reactivate(request, h) {
  const staticCourseId = request.params.id;
  const staticCourseToUpdate = await staticCourseRepository.get(staticCourseId);
  if (!staticCourseToUpdate) {
    throw new NotFoundError(`Le test statique d'id ${staticCourseId} n'existe pas ou son accès restreint`);
  }
  const commandResult = staticCourseToUpdate.reactivate();
  if (commandResult.isFailure()) {
    throw commandResult.error;
  }
  await staticCourseRepository.save(commandResult.value);
  const staticCourseReadModel = await staticCourseRepository.getRead(staticCourseId, { baseUrl: getBaseUrl(request) });
  return h.response(staticCourseSerializer.serialize(staticCourseReadModel));
}

function normalizeCreationOrUpdateCommand(attrs) {
  return {
    name: _.isString(attrs.name) ? attrs.name : '',
    description: _.isString(attrs.description) ? attrs.description : '',
    challengeIds: _.isArray(attrs['challenge-ids']) ? attrs['challenge-ids'] : [],
    tagIds: _.isArray(attrs['tag-ids']) ? attrs['tag-ids'].map((tagId) => parseInt(tagId)) : [],
  };
}

function normalizeDeactivationCommand(attrs) {
  return {
    reason: _.isString(attrs.reason) ? attrs.reason : '',
  };
}

function getBaseUrl(request) {
  return `${request.url.protocol}//${request.url.host}`;
}
