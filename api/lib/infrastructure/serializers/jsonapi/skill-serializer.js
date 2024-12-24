import Jsonapi from 'jsonapi-serializer';

const {  Serializer } = Jsonapi;

const serializer = new Serializer('skill', {
  attributes: [
    'name',
    'clue',
    'clueEn',
    'clueStatus',
    'challenges',
    'createdAt',
    'description',
    'descriptionStatus',
    'tutoSolution',
    'tutoMore',
    'tube',
    'level',
    'status',
    'i18n',
    'pixId',
    'version',
  ],
  typeForAttribute(attribute) {
    if (['tutoSolution', 'tutoMore'].includes(attribute)) return 'tutorials';
  },
  transform({
    id,
    airtableId,
    hint_i18n,
    hintStatus,
    internationalisation,
    challengeIds,
    tutorialAirtableIds,
    learningMoreTutorialAirtableIds,
    tubeAirtableId,
    ...skill
  }) {
    return {
      ...skill,
      id: airtableId,
      pixId: id,
      clue: hint_i18n.fr,
      clueEn: hint_i18n.en,
      clueStatus: hintStatus,
      i18n: internationalisation,
      challenges: challengeIds?.map((id) => ({ id })),
      tutoSolution: tutorialAirtableIds?.map((id) => ({ id })),
      tutoMore: learningMoreTutorialAirtableIds?.map((id) => ({ id })),
      tube: tubeAirtableId && { id: tubeAirtableId },
    };
  },
  challenges: {
    ref: 'id',
  },
  tutoSolution: {
    ref: 'id',
  },
  tutoMore: {
    ref: 'id',
  },
  tube: {
    ref: 'id',
  },
});

export function serialize(areas) {
  return serializer.serialize(areas);
}
