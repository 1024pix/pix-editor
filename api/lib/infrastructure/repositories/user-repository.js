import { User } from '../../domain/models/index.js';
import { UserNotFoundError } from '../../domain/errors.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';

export async function findByApiKey(apiKey) {
  const knexConn = DomainTransaction.getConnection();
  const user = await knexConn('users').where('apiKey', apiKey).first();
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
    updatedAt: user.updatedAt,
  });
}
