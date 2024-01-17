import { localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { ForbiddenError } from '../errors.js';

export async function modifyLocalizedChallenge({ isAdmin, localizedChallenge }, dependencies = { localizedChallengeRepository }) {
  return knex.transaction(async (transaction) => {
    const originalLocalizedChallenge = await dependencies.localizedChallengeRepository.get({
      id: localizedChallenge.id,
      transaction
    });
    if (!isAdmin && localizedChallenge.status !== originalLocalizedChallenge.status) {
      throw new ForbiddenError();
    }
    return dependencies.localizedChallengeRepository.update({ localizedChallenge, transaction });
  });
}
