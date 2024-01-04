import { Challenge, Translation } from '../../domain/models/index.js';

export const prefix = 'challenge.';

export const fields = [
  'instruction',
  'alternativeInstruction',
  'proposals',
  'solution',
  'solutionToDisplay',
];

const writableFields = [
  'embedTitle',
];

export function extractFromChallenge(challenge) {
  const locale = Challenge.getPrimaryLocale(challenge.locales);
  return [...fields, ...writableFields]
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
