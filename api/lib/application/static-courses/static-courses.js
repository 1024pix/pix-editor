const _ = require('lodash');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const staticCourseRepository = require('../../infrastructure/repositories/static-course-repository');
const staticCourseSerializer = require('../../infrastructure/serializers/jsonapi/static-course-serializer');
const idGenerator = require('../../infrastructure/utils/id-generator');
const StaticCourse = require('../../domain/models/StaticCourse');
const { InvalidStaticCourseCreationOrUpdateError, NotFoundError } = require('../../domain/errors');

const DEFAULT_PAGE = {
  number: 1,
  size: 10,
  maxSize: 100,
};

module.exports = {
  findSummaries,
  get,
  create,
  update,
};

async function findSummaries(request, h) {
  const { page } = extractParameters(request.query);
  const { results: staticCourseSummaries, meta } = await staticCourseRepository.findReadSummaries({ page: normalizePage(page) });
  return h.response(staticCourseSerializer.serializeSummary(staticCourseSummaries, meta));
}

async function get(request, h) {
  const staticCourseId = request.params.id;
  const staticCourse = await staticCourseRepository.getRead(staticCourseId);
  return h.response(staticCourseSerializer.serialize(staticCourse));
}

async function create(request, h) {
  const creationCommand = normalizeCreationOrUpdateCommand(request.payload.data.attributes);
  const allChallengeIds = await challengeRepository.getAllIdsIn(creationCommand.challengeIds);
  const commandResult = StaticCourse.buildFromCreationCommand({
    creationCommand,
    allChallengeIds,
    idGenerator: idGenerator.generateNewId,
  });
  if (commandResult.isFailure()) {
    throw new InvalidStaticCourseCreationOrUpdateError(commandResult.failureReasons);
  }
  const staticCourseId = await staticCourseRepository.save(commandResult.value);
  const staticCourseReadModel = await staticCourseRepository.getRead(staticCourseId);
  return h.response(staticCourseSerializer.serialize(staticCourseReadModel)).created();
}

async function update(request, h) {
  const staticCourseId = request.params.id;
  const updateCommand = normalizeCreationOrUpdateCommand(request.payload.data.attributes);
  const allChallengeIds = await challengeRepository.getAllIdsIn(updateCommand.challengeIds);
  const staticCourseToUpdate = await staticCourseRepository.get(staticCourseId);
  if (!staticCourseToUpdate) {
    throw new NotFoundError(`Le test statique d'id ${staticCourseId} n'existe pas ou son accès restreint`);
  }
  const commandResult = staticCourseToUpdate.update({
    updateCommand,
    allChallengeIds,
  });
  if (commandResult.isFailure()) {
    throw new InvalidStaticCourseCreationOrUpdateError(commandResult.failureReasons);
  }
  await staticCourseRepository.save(commandResult.value);
  const staticCourseReadModel = await staticCourseRepository.getRead(staticCourseId);
  return h.response(staticCourseSerializer.serialize(staticCourseReadModel));
}

function normalizePage(page) {
  return {
    number: _.isInteger(page.number) && Math.sign(page.number) === 1 ? page.number : DEFAULT_PAGE.number,
    size: _.isInteger(page.size) && Math.sign(page.size) === 1 ? Math.min(page.size, DEFAULT_PAGE.maxSize) : DEFAULT_PAGE.size,
  };
}

function normalizeCreationOrUpdateCommand(attrs) {
  return {
    name: _.isString(attrs.name) ? attrs.name : '',
    description: _.isString(attrs.description) ? attrs.description : '',
    challengeIds: _.isArray(attrs['challenge-ids']) ? attrs['challenge-ids'] : [],
  };
}
