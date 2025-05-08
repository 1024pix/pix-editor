const createChallenge = async function({ challenge, challengeRepository, normalizeNonBreakingSpace }) {
  if (challenge.locales.includes('fr') || challenge.locales.includes('fr-fr')) {
    const fieldsToNormalize = ['instruction', 'proposals', 'alternativeInstruction'];
    for (const field of fieldsToNormalize) {
      if (challenge[field]) {
        challenge[field] = normalizeNonBreakingSpace(challenge[field]);
      }
    }
  }
  return challengeRepository.create(challenge);
};

createChallenge.NEED_TRX = true;

export { createChallenge };
