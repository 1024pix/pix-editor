const StaticCourse = require('../../../../lib/domain/models/StaticCourse');

module.exports = function buildStaticCourse({
  id = 'courseABC123',
  name = 'static course name',
  description = 'static course description',
  challengeIds = ['challengeid-1', 'challengeid-2'],
  isActive = true,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  return new StaticCourse({
    id,
    name,
    description,
    challengeIds,
    isActive,
    createdAt,
    updatedAt,
  });
};
