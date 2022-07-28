const databaseBuffer = require('../database-buffer');

module.exports = function buildTraining({
  id,
  title,
  link,
  type,
  duration,
  locale,
  targetProfileIds,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  const values = {
    id,
    title,
    link,
    type,
    duration,
    locale,
    targetProfileIds,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'trainings',
    values,
  });
};
