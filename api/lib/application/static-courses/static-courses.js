import _ from 'lodash';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { localizedChallengeRepository, staticCourseRepository } from '../../infrastructure/repositories/index.js';
import { staticCourseSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import * as idGenerator from '../../infrastructure/utils/id-generator.js';
import { StaticCourse } from '../../domain/models/index.js';
import { NotFoundError } from '../../domain/errors.js';

const DEFAULT_PAGE = {
  number: 1,
  size: 10,
  maxSize: 100,
};

export async function findSummaries(request, h) {
  const { filter, page } = extractParameters(request.query);
  const { results: staticCourseSummaries, meta } = await staticCourseRepository.findReadSummaries({ filter: normalizeFilter(filter), page: normalizePage(page) });
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
  const commandResult = StaticCourse.buildFromCreationCommand({
    creationCommand,
    allChallengeIds: localizedChallenges.map(({ id }) => id),
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
  const commandResult = staticCourseToUpdate.update({
    updateCommand,
    allChallengeIds: localizedChallenges.map(({ id }) => id),
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

function normalizePage(page) {
  return {
    number: _.isInteger(page.number) && Math.sign(page.number) === 1 ? page.number : DEFAULT_PAGE.number,
    size: _.isInteger(page.size) && Math.sign(page.size) === 1 ? Math.min(page.size, DEFAULT_PAGE.maxSize) : DEFAULT_PAGE.size,
  };
}

function normalizeFilter(filter) {
  const normalizedFilter = {};
  if (filter.isActive === undefined)
    normalizedFilter.isActive = null;
  else if (_.isString(filter.isActive)) {
    const trimmedValueFromFilter = filter.isActive.trim().toLowerCase();
    if (trimmedValueFromFilter === '') normalizedFilter.isActive = null;
    else normalizedFilter.isActive = trimmedValueFromFilter === 'true';
  } else {
    normalizedFilter.isActive = false;
  }

  if (filter.name) {
    const trimmedValueFromFilter = filter.name.toString().trim();
    if (trimmedValueFromFilter.length > 0) normalizedFilter.name = trimmedValueFromFilter;
    else normalizedFilter.name = null;
  }
  else {
    normalizedFilter.name = null;
  }

  return normalizedFilter;
}

function normalizeCreationOrUpdateCommand(attrs) {
  return {
    name: _.isString(attrs.name) ? attrs.name : '',
    description: _.isString(attrs.description) ? attrs.description : '',
    challengeIds: _.isArray(attrs['challenge-ids']) ? attrs['challenge-ids'] : [],
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
