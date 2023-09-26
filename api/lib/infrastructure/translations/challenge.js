import { Translation } from '../../domain/models/index.js';

export const prefix = 'challenge.';

const fields = [
  'instruction',
  'alternativeInstruction',
  'proposals',
  'solution',
  'solutionToDisplay',
];

function getPrimaryLocaleFromChallenge(locales) {
  return locales.sort()[0];
}

export function extractFromChallenge(challenge) {
  const locale = getPrimaryLocaleFromChallenge(challenge.locales);
  const id = challenge.id;
  return fields
    .filter((field) => challenge[field])
    .map((field) => {
      return new Translation({
        key: `${prefix}${id}.${field}`,
        locale: locale,
        value: challenge[field],
      });
    });
}
