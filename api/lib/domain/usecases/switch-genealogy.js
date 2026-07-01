import { challengeRepository, localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { DomainTransaction } from '../DomainTransaction.js';

export async function switchGenealogy({ alternativeChallengeId, dependencies = { challengeRepository, localizedChallengeRepository } }) {
  const alternativeChallenge = await dependencies.challengeRepository.get(alternativeChallengeId);
  const prototypeChallenge = await dependencies.challengeRepository.getPrototypeBySkillId(alternativeChallenge.skillId, alternativeChallenge.version);
  const localizedPrototypeChallenge = prototypeChallenge.primaryLocalizedChallenge;

  prototypeChallenge.switchToAlternative({ alternativeVersion: alternativeChallenge.alternativeVersion });
  alternativeChallenge.switchToPrototype({
    accessibility1: prototypeChallenge.accessibility1,
    accessibility2: prototypeChallenge.accessibility2,
    requireGafamWebsiteAccess: localizedPrototypeChallenge.requireGafamWebsiteAccess,
    isIncompatibleIpadCertif: localizedPrototypeChallenge.isIncompatibleIpadCertif,
    deafAndHardOfHearing: localizedPrototypeChallenge.deafAndHardOfHearing,
    isAwarenessChallenge: localizedPrototypeChallenge.isAwarenessChallenge,
    toRephrase: localizedPrototypeChallenge.toRephrase,
    hasEmbedInternalValidation: localizedPrototypeChallenge.hasEmbedInternalValidation,
    noValidationNeeded: localizedPrototypeChallenge.noValidationNeeded,
  });

  const pojoAlternativeToPrototypeToUpdate = alternativeChallenge.dataOnSwitchGenealogy;
  const pojoPrototypeToAlternativeToUpdate = prototypeChallenge.dataOnSwitchGenealogy;

  pojoAlternativeToPrototypeToUpdate.localizedChallenge.id = alternativeChallenge.primaryLocalizedChallenge.id;

  return DomainTransaction.execute(async () => {
    await dependencies.challengeRepository.updateByChallengeId(pojoPrototypeToAlternativeToUpdate);
    await dependencies.challengeRepository.updateByChallengeId(pojoAlternativeToPrototypeToUpdate.challenge);
    await dependencies.localizedChallengeRepository.updateByLocalizedChallengeId(pojoAlternativeToPrototypeToUpdate.localizedChallenge);
  });
}
