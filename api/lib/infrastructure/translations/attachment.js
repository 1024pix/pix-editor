import { Translation } from '../../domain/models/index.js';
import { localizedChallengeRepository } from '../repositories/index.js';
import { prefixFor } from './challenge.js';

export const prefix = 'challenge.';

export async function extractFromProxyObject(airtableAttachment) {
  const { alt: illustrationAlt, localizedChallengeId } = airtableAttachment;

  if (!illustrationAlt || !localizedChallengeId) {
    return [];
  }

  const localizedChallenge = await localizedChallengeRepository.get({ id: localizedChallengeId });

  return new Translation({
    key: `${prefixFor({ id: localizedChallenge.challengeId })}illustrationAlt`,
    locale: localizedChallenge.locale,
    value: illustrationAlt,
  });
}

