import { LocalizedChallenge } from '../readmodels/index.js';

export async function getSkillLocalizedChallengesProduction({
  skillId,
  dependencies: {
    challengeRepository,
    logger,
  },
}) {
  const challenges = await challengeRepository.listBySkillId(skillId);
  const validatedPrototype = challenges.find((challenge) => challenge.isPrototype && challenge.isValide);
  if (!validatedPrototype) {
    logger.warn(`usecase: getSkillLocalizedChallengesProduction. Pas de proto validé pour acquis "${skillId}"`);
    return [];
  }
  const productionChallenges = challenges
    .filter((challenge) => challenge.version === validatedPrototype.version)
    .sort(byAlternativeVersion);

  const localizedChallengesProduction = [];
  for (const productionChallenge of productionChallenges) {
    const localizedChallengesProductionForChallenge = [];
    for (const localizedChallenge of productionChallenge.localizedChallenges) {
      localizedChallengesProductionForChallenge.push(LocalizedChallenge.buildFromChallengeAndLocale(productionChallenge, localizedChallenge.locale));
    }
    localizedChallengesProduction.push(...localizedChallengesProductionForChallenge.toSorted(byLocale));
  }
  return localizedChallengesProduction;
}

function byLocale(localizedA, localizedB) {
  return localizedA.locale.localeCompare(localizedB.locale);
}

function byAlternativeVersion(challengeA, challengeB) {
  if (challengeA.isPrototype) {
    return -1;
  }
  if (challengeB.isPrototype) {
    return 1;
  }
  return challengeA.alternativeVersion - challengeB.alternativeVersion;
}
