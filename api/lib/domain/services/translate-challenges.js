import { Challenge } from '../../domain/models/Challenge.js';
import { fields as challengeLocalizedFields } from '../../infrastructure/translations/challenge.js';

export function translateChallenges({ localizedChallenges }) {
  return (challenge) => localizedChallenges
    .filter((localizedChallenge) => localizedChallenge.challengeId === challenge.id)
    .map((localizedChallenge) => translateChallenge(challenge, localizedChallenge));
}

export function translateChallenge(challenge, localizedChallenge) {
  const primaryLocale = Challenge.getPrimaryLocale(challenge.locales) ?? 'fr';
  const isPrimaryLocale = primaryLocale === localizedChallenge.locale;
  const clearedLocalizedFields = challengeLocalizedFields.reduce((acc, field) => {
    acc[field] = '';
    return acc;
  }, {});
  return {
    ...challenge,
    ...clearedLocalizedFields,
    ...challenge.translations[localizedChallenge.locale],
    id: localizedChallenge.id,
    status: isPrimaryLocale ? challenge.status : getLocalizedChallengeStatus(challenge, localizedChallenge),
    embedUrl: localizedChallenge.embedUrl ?? _replaceLangParamsInUrl(localizedChallenge.locale, challenge.embedUrl),
    locales: isPrimaryLocale ? challenge.locales : [localizedChallenge.locale],
  };
}

function getLocalizedChallengeStatus(challenge, localizedChallenge) {
  if (['proposé', 'périmé'].includes(challenge.status) || localizedChallenge.status === 'validé') {
    return challenge.status;
  }
  return localizedChallenge.status;
}

function _replaceLangParamsInUrl(locale, embedUrl) {
  if (!embedUrl) return undefined;
  const url = new URL(embedUrl);
  url.searchParams.set('lang', locale);
  return url.href;
}

