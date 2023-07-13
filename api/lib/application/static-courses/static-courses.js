const _ = require('lodash');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const staticCourseRepository = require('../../infrastructure/repositories/static-course-repository');
const staticCourseSerializer = require('../../infrastructure/serializers/jsonapi/static-course-serializer');
const idGenerator = require('../../infrastructure/utils/id-generator');
const StaticCourse = require('../../domain/models/StaticCourse');
const { InvalidStaticCourseCreationError } = require('../../domain/errors');

const DEFAULT_PAGE = {
  number: 1,
  size: 10,
  maxSize: 100,
};

module.exports = {
  findSummaries,
  get,
  create,
};

async function findSummaries(request, h) {
  const { page } = extractParameters(request.query);
  const { results: staticCourseSummaries, meta } = await staticCourseRepository.findSummaries({ page: normalizePage(page) });
  return h.response(staticCourseSerializer.serializeSummary(staticCourseSummaries, meta));
}

async function get(request, h) {
  const staticCourseId = request.params.id;
  const staticCourse = await staticCourseRepository.get(staticCourseId);
  return h.response(staticCourseSerializer.serialize(staticCourse));
}

async function create(request, h) {
  const creationCommand = normalizeCreationCommand(request.payload.data.attributes);
  const allChallengeIds = await challengeRepository.getAllIdsIn(creationCommand.challengeIds);
  const commandResult = StaticCourse.buildFromCreationCommand({
    creationCommand,
    allChallengeIds,
    idGenerator: idGenerator.generateNewId,
  });
  if (commandResult.isFailure()) {
    throw new InvalidStaticCourseCreationError(commandResult.failureReasons);
  }
  const staticCourseId = await staticCourseRepository.save(commandResult.value);
  const staticCourseReadModel = await staticCourseRepository.get(staticCourseId);
  return h.response(staticCourseSerializer.serialize(staticCourseReadModel)).created();
}

function normalizePage(page) {
  return {
    number: _.isInteger(page.number) && Math.sign(page.number) === 1 ? page.number : DEFAULT_PAGE.number,
    size: _.isInteger(page.size) && Math.sign(page.size) === 1 ? Math.min(page.size, DEFAULT_PAGE.maxSize) : DEFAULT_PAGE.size,
  };
}

function normalizeCreationCommand(attrs) {
  return {
    name: _.isString(attrs.name) ? attrs.name : '',
    description: _.isString(attrs.description) ? attrs.description : '',
    challengeIds: _.isArray(attrs['challenge-ids']) ? attrs['challenge-ids'] : [],
  };
}
