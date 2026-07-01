import { challengeRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';

export async function switchGenealogy({ alternativeChallengeId, dependencies = { challengeRepository } }) {
  const alternativeChallenge = await dependencies.challengeRepository.get(alternativeChallengeId);
  const prototypeChallenge = await dependencies.challengeRepository.getPrototypeBySkillId(alternativeChallenge.skillId, alternativeChallenge.version);

  prototypeChallenge.switchToAlternative({ alternativeVersion: alternativeChallenge.alternativeVersion });
  alternativeChallenge.switchToPrototype({ accessibility1: prototypeChallenge.accessibility1, accessibility2: prototypeChallenge.accessibility2 });

  const pojoAlternativeVersionToUpdate = alternativeChallenge.dataOnSwitchGenealogy;
  const pojoPrototypeVersionToUpdate = prototypeChallenge.dataOnSwitchGenealogy;

  return DomainTransaction.execute(async () => {
    await dependencies.challengeRepository.updateByChallengeId(pojoAlternativeVersionToUpdate);
    await dependencies.challengeRepository.updateByChallengeId(pojoPrototypeVersionToUpdate);
  });
}
