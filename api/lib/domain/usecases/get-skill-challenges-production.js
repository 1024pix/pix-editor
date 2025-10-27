export async function getSkillChallengesProduction({ skillId, dependencies: { challengeRepository, logger } }) {
  const challenges = await challengeRepository.listBySkillId(skillId);
  const validatedPrototype = challenges.find((challenge) => challenge.isPrototype && challenge.isValide);
  if (!validatedPrototype) {
    logger.warn(`usecase: getSkillChallengesProduction. Pas de proto validé pour acquis "${skillId}"`);
    return [];
  }
  return challenges.filter((challenge) => validatedPrototype.version === challenge.version).sort(byAlternativeVersion);
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
