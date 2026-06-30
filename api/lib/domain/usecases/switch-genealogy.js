import { challengeRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';

export async function switchGenealogy({ alternativeChallengeId, dependencies = { challengeRepository }}) {
  const alternativeChallenge = await dependencies.challengeRepository.get(alternativeChallengeId);
  const prototypeChallenge = await dependencies.challengeRepository.getPrototypeByAlternativeId(alternativeChallengeId);

  prototypeChallenge.switchToAlternative({ alternativeVersion: alternativeChallenge.alternativeVersion });
  alternativeChallenge.switchToPrototype();

  const pojoAlternativeVersionToUpdate = alternativeChallenge.dataOnSwitchGenealogy;
  const pojoPrototypeVersionToUpdate = prototypeChallenge.dataOnSwitchGenealogy;

  return DomainTransaction.execute(async () => {
    await dependencies.challengeRepository.updateByChallengeId(pojoAlternativeVersionToUpdate);
    await dependencies.challengeRepository.updateByChallengeId(pojoPrototypeVersionToUpdate);
  });
}
