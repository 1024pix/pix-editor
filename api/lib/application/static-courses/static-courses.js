const _ = require('lodash');
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const staticCourseRepository = require('../../infrastructure/repositories/static-course-repository');
const staticCourseSerializer = require('../../infrastructure/serializers/jsonapi/static-course-serializer');

const DEFAULT_PAGE = {
  number: 1,
  size: 10,
  maxSize: 100,
};

module.exports = {
  findSummaries,
  get,
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

function normalizePage(page) {
  return {
    number: _.isInteger(page.number) && Math.sign(page.number) === 1 ? page.number : DEFAULT_PAGE.number,
    size: _.isInteger(page.size) && Math.sign(page.size) === 1 ? Math.min(page.size, DEFAULT_PAGE.maxSize) : DEFAULT_PAGE.size,
  };
}
