const StaticCourse = require('../../../../lib/domain/models/StaticCourse');

module.exports = function buildStaticCourse({
  id = 'static-course-id',
  name = 'static course name',
  challengeIds = ['challengeid-1', 'challengeid-2'],
  createdAt = new Date(),
} = {}) {

  return new StaticCourse({
    id,
    name,
    challengeIds,
    createdAt
  });
};
