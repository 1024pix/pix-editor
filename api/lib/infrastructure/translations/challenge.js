import { Translation } from '../../domain/models/index.js';

export const prefix = 'challenge.';

const fields = [
  { airtableField: 'Consigne', field: 'instruction' },
  { airtableField: 'Consigne alternative', field: 'alternativeInstruction' },
  { airtableField: 'Propositions', field: 'proposals' },
  { airtableField: 'Bonnes réponses', field: 'solution' },
  { airtableField: 'Bonnes réponses à afficher', field: 'solutionToDisplay' },
];

function getPrimaryLocaleFromChallenge(locales) {
  const defaultLocale = 'fr';
  return locales.sort()[0] ?? defaultLocale;
}

export function extractFromChallenge(challenge) {
  const locale = getPrimaryLocaleFromChallenge(challenge.locales);
  const id = challenge.id;
  return fields
    .filter(({ field }) => challenge[field])
    .map(({ field }) => {
      return new Translation({
        key: `${prefix}${id}.${field}`,
        locale: locale,
        value: challenge[field],
      });
    });
}
