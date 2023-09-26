import { Translation } from '../../domain/models/index.js';

export const prefix = 'challenge.';

const fields = [
  { airtableField: 'Consigne', field: 'instruction' },
  { airtableField: 'Consigne alternative', field: 'alternativeInstruction' },
  { airtableField: 'Propositions', field: 'proposals' },
  { airtableField: 'Bonnes réponses', field: 'solution' },
  { airtableField: 'Bonnes réponses à afficher', field: 'solutionToDisplay' },
];

export function extractFromChallenge(challenge) {
  const locale = challenge.locales[0];
  const id = challenge.id;
  return fields.map(({ field }) => {
    return new Translation({
      key: `${prefix}${id}.${field}`,
      locale: locale,
      value: challenge[field],
    });
  });
}

