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
    spoil: prototypeChallenge.spoil,
    responsive: prototypeChallenge.responsive,
    translationMaintenanceTags: prototypeChallenge.translationMaintenanceTags,
    assessmentMaintenanceTags: prototypeChallenge.assessmentMaintenanceTags,
    requireGafamWebsiteAccess: localizedPrototypeChallenge.requireGafamWebsiteAccess,
    isIncompatibleIpadCertif: localizedPrototypeChallenge.isIncompatibleIpadCertif,
    deafAndHardOfHearing: localizedPrototypeChallenge.deafAndHardOfHearing,
    isAwarenessChallenge: localizedPrototypeChallenge.isAwarenessChallenge,
    toRephrase: localizedPrototypeChallenge.toRephrase,
    hasEmbedInternalValidation: localizedPrototypeChallenge.hasEmbedInternalValidation,
    noValidationNeeded: localizedPrototypeChallenge.noValidationNeeded,
  });

  return DomainTransaction.execute(async () => {
    await dependencies.challengeRepository.updateByChallengeId(prototypeChallenge.dataOnSwitchGenealogy);
    await dependencies.challengeRepository.updateByChallengeId(alternativeChallenge.dataOnSwitchGenealogy);
    await dependencies.localizedChallengeRepository.updateByLocalizedChallengeId(alternativeChallenge.primaryLocalizedChallenge.dataOnSwitchGenealogy);
  });
}
