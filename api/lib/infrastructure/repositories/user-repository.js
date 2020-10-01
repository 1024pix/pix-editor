const User = require('../../domain/models/User');
const { knex } = require('../../../db/knex-database-connection');
const { UserNotFoundError } = require('../../domain/errors');

async function findByApiKey(apiKey) {
  const user = await knex('users').where('apiKey', apiKey).first();
  if (!user) {
    throw new UserNotFoundError();
  }
  return new User({
    id: user.id,
    apiKey: user.apiKey,
    name: user.name,
    trigram: user.trigram,
    access: user.access,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
}

module.exports = {
  findByApiKey
};
