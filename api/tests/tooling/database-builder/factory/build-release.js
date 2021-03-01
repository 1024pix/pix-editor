const databaseBuffer = require('../database-buffer');

module.exports = function buildRelease({
  id,
  content,
  createdAt = new Date(),
} = {}) {

  const values = { id, content, createdAt };

  return databaseBuffer.pushInsertable({
    tableName: 'releases',
    values,
  });
};

