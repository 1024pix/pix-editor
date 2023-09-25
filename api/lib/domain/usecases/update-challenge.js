import { challengeRepository, translationRepository } from '../../infrastructure/repositories/index.js';
import * as challengeTranslations from '../../infrastructure/translations/challenge.js';

export async function updateChallenge(challenge, dependencies = { challengeRepository, translationRepository }) {
  const translations = challengeTranslations.extractFromChallenge(challenge);
  const updatedChallenge = dependencies.challengeRepository.update(challenge);
  await dependencies.translationRepository.deleteByKeyPrefix(`${challengeTranslations.prefix}${challenge.id}`);
  await dependencies.translationRepository.save(translations);

  return updatedChallenge;
}
