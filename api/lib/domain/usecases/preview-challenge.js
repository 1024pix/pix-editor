import * as repositories from '../../infrastructure/repositories/index.js';
import * as config from '../../config.js';

export async function previewChallenge(
  { challengeId, locale },
  {
    localizedChallengeRepository = repositories.localizedChallengeRepository,
    challengeRepository = repositories.challengeRepository,
    refreshCache,
  },
) {
  if (!locale) return new URL(`challenges/${challengeId}/preview`, config.pixApp.baseUrl).href;
  const localizedChallenge = await localizedChallengeRepository.getByChallengeIdAndLocale({ challengeId, locale });
  const challenge = await challengeRepository.get(challengeId);
  await refreshCache({ challenge, localizedChallenge });
  return new URL(`challenges/${localizedChallenge.id}/preview`, config.pixApp.baseUrl).href;
}
