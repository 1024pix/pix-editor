import { localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { ForbiddenError } from '../errors.js';

export async function modifyLocalizedChallenge(
  { isAdmin, localizedChallenge },
  dependencies = { localizedChallengeRepository },
) {
  return DomainTransaction.execute(async () => {
    const originalLocalizedChallenge = await dependencies.localizedChallengeRepository.get({ id: localizedChallenge.id });
    if (!isAdmin && localizedChallenge.status !== originalLocalizedChallenge.status) {
      throw new ForbiddenError();
    }
    originalLocalizedChallenge.update(localizedChallenge);
    return dependencies.localizedChallengeRepository.update({ localizedChallenge: originalLocalizedChallenge });
  });
}
