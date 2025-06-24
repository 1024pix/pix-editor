import { localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { ForbiddenError } from '../errors.js';
import { LocalizedChallenge } from '../models/index.js';

export async function modifyLocalizedChallenge({ isAdmin, localizedChallenge }, dependencies = { localizedChallengeRepository }) {
  return knex.transaction(async (transaction) => {
    const originalLocalizedChallenge = await dependencies.localizedChallengeRepository.get({
      id: localizedChallenge.id,
      transaction
    });
    if (!isAdmin && localizedChallenge.status !== originalLocalizedChallenge.status) {
      throw new ForbiddenError();
    }
    if (localizedChallenge.status === LocalizedChallenge.STATUSES.PLAY && originalLocalizedChallenge.status !== localizedChallenge.status) {
      localizedChallenge.validatedAt = new Date();
    } else {
      localizedChallenge.validatedAt = originalLocalizedChallenge.validatedAt;
    }
    return dependencies.localizedChallengeRepository.update({ localizedChallenge, transaction });
  });
}
