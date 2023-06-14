const databaseBuffer = require('../database-buffer');

function buildStaticCourse({
  id,
  name,
  description,
  challengeIds,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {

  const values = { id, name, description, challengeIds, createdAt, updatedAt };

  return databaseBuffer.pushInsertable({
    tableName: 'static_courses',
    values,
  });
}

module.exports = buildStaticCourse;

