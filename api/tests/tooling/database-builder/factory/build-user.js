const databaseBuffer = require('../database-buffer');

module.exports = function buildUser({
  id,
  name,
  trigram,
  access,
  apiKey,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {

  const values = { id, name, trigram, access, apiKey, createdAt, updatedAt };

  return databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });
};

