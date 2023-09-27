import { challengeRepository, translationRepository } from '../../infrastructure/repositories/index.js';
import * as challengeTranslations from '../../infrastructure/translations/challenge.js';

export async function createChallenge(challenge, dependencies = { challengeRepository, translationRepository }) {
  const translations = challengeTranslations.extractFromChallenge(challenge);
  const createdChallenge = await dependencies.challengeRepository.create(challenge);
  await dependencies.translationRepository.save(translations);

  return createdChallenge;
}
