const databaseBuffer = require('../database-buffer');

function buildStaticCourse({
  id = 'staticCourseABC123',
  name = 'Mon super test statique',
  description = 'Ma super description de test statique',
  challengeIds = 'challengeABC, challengeDEF',
  imageUrl = 'ma/super/image.png',
  createdAt = new Date('2010-01-04'),
  updatedAt = new Date('2010-01-11'),
} = {}) {

  const values = { id, name, description, challengeIds, imageUrl, createdAt, updatedAt };

  return databaseBuffer.pushInsertable({
    tableName: 'static_courses',
    values,
  });
}

module.exports = buildStaticCourse;

