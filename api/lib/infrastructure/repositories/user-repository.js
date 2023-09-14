import { User } from '../../domain/models/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { UserNotFoundError } from '../../domain/errors.js';

export async function findByApiKey(apiKey) {
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
