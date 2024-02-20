import { Translation } from '../../domain/models/index.js';
import { localizedChallengeRepository } from '../repositories/index.js';
import { prefixFor as prefixForChallenge } from './challenge.js';

export const prefix = 'challenge.';

export async function prefixFor(airtableAttachment) {
  const localizedChallenge = await getLocalizedChallenge(airtableAttachment);

  return `${prefixForChallenge({ id: localizedChallenge.challengeId })}illustrationAlt`;
}

export async function extractFromProxyObject(airtableAttachment) {
  if (!airtableAttachment.alt) return [];

  const localizedChallenge = await getLocalizedChallenge(airtableAttachment);

  return [
    new Translation({
      key: `${prefixForChallenge({ id: localizedChallenge.challengeId })}illustrationAlt`,
      locale: localizedChallenge.locale,
      value: airtableAttachment.alt,
    }),
  ];
}

export async function airtableObjectToProxyObject(airtableObject, translations) {
  const localizedChallenge = await localizedChallengeRepository.get({ id: airtableObject.localizedChallengeId });
  const translation = translations.find(({ key, locale }) => key === `${prefixForChallenge({ id: localizedChallenge.challengeId })}illustrationAlt` && locale === localizedChallenge.locale);

  return {
    ...airtableObject,
    alt: translation?.value ?? null,
  };
}

async function getLocalizedChallenge(airtableAttachment) {
  const { localizedChallengeId } = airtableAttachment;

  return localizedChallengeRepository.get({ id: localizedChallengeId });
}
