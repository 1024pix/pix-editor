const databaseBuffer = require('../database-buffer');

function buildUser({
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
}

function buildAdminUser() {
  return buildUser({ name: 'User', trigram: 'ADM', access: 'admin', apiKey: '00000000-0000-0000-0000-000000000000' });
}

function buildReadonlyUser() {
  return buildUser({ name: 'User', trigram: 'RDO', access: 'readonly', apiKey: '10000000-0000-0000-0000-000000000000' });
}

module.exports = {
  buildUser,
  buildAdminUser,
  buildReadonlyUser,
};

