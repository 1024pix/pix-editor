import { Challenge, Translation } from '../../domain/models/index.js';

export const prefix = 'challenge.';

export const fields = [
  'instruction',
  'alternativeInstruction',
  'proposals',
  'solution',
  'solutionToDisplay',
  'embedTitle',
  'illustrationAlt',
];

export function extractFromLocalizedChallenge(localizedChallenge) {
  const locale = localizedChallenge.locale;
  return fields
    .filter((field) => localizedChallenge[field])
    .map((field) => {
      return new Translation({
        key: `${prefixForDeux(localizedChallenge)}${field}`,
        locale: locale,
        value: localizedChallenge[field],
      });
    });
}

export function extractFromChallenge(challenge) {
  const locale = Challenge.getPrimaryLocale(challenge.locales);
  return fields
    .filter((field) => challenge[field])
    .map((field) => {
      return new Translation({
        key: `${prefixFor(challenge)}${field}`,
        locale: locale,
        value: challenge[field],
      });
    });
}

export function prefixFor(challenge) {
  return `${prefix}${challenge.id}.`;
}

export function prefixForDeux(localizedChallenge) {
  return `${prefix}${localizedChallenge.challengeId}.`;
}
