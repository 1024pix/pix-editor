import * as repositories from '../../infrastructure/repositories/index.js';
import * as config from '../../config.js';

export async function previewChallenge(
  { challengeId, locale },
  {
    challengeRepository = repositories.challengeRepository,
    refreshCache,
  },
) {
  if (!locale) return new URL(`challenges/${challengeId}/preview`, config.pixApp.baseUrlFr).href;
  const challenge = await challengeRepository.get(challengeId);
  const translatedChallenge = challenge.translate(locale);
  await refreshCache({ challenge: translatedChallenge });
  const url = new URL(`challenges/${translatedChallenge.id}/preview`, config.pixApp.baseUrlOrg);
  url.searchParams.set('lang', locale);
  return url.href;
}
