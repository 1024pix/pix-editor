import { challengeRepository } from '../../infrastructure/repositories/index.js';
import { normalizeNonBreakingSpace } from '../../infrastructure/utils/normalize-non-breaking-space.js';

export async function createChallenge(challenge, dependencies = { challengeRepository }) {
  if (challenge.locales.includes('fr') || challenge.locales.includes('fr-fr')) {
    const fieldsToNormalize = ['instruction', 'proposals', 'alternativeInstruction'];
    for (const field of fieldsToNormalize) {
      if (challenge[field]) {
        challenge[field] = normalizeNonBreakingSpace(challenge[field]);
      }
    }
  }
  return dependencies.challengeRepository.create(challenge);
}
