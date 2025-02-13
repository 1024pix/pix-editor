import Jsonapi from 'jsonapi-serializer';
import { Skill } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('skill', {
  attributes: [
    'name',
    'clue',
    'clueEn',
    'clueStatus',
    'challenges',
    'challengesProduction',
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
      challengesProduction: {},
      tutoSolution: tutorialAirtableIds?.map((id) => ({ id })),
      tutoMore: learningMoreTutorialAirtableIds?.map((id) => ({ id })),
      tube: tubeAirtableId && { id: tubeAirtableId },
    };
  },
  challenges: {
    ref: 'id',
  },
  challengesProduction: {
    ref: 'id',
    ignoreRelationshipData: true,
    relationshipLinks: {
      related(skill) {
        return `/api/skills/${skill.pixId}/challenges-production`;
      },
    },
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

export function serialize(skills) {
  return serializer.serialize(skills);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  tubes: {
    valueForRelationship({ id }) {
      return id;
    },
  },
  tutorials: {
    valueForRelationship({ id }) {
      return id;
    },
  },
  transform({
    id,
    pixId,
    clue,
    clueEn,
    clueStatus: hintStatus,
    i18n: internationalisation,
    tube: tubeAirtableId,
    tutoSolution: tutorialAirtableIds,
    tutoMore: learningMoreTutorialAirtableIds,
    ...skill
  }) {
    return new Skill({
      ...skill,
      airtableId: id,
      id: pixId,
      tubeAirtableId,
      tutorialAirtableIds,
      learningMoreTutorialAirtableIds,
      hint_i18n: {
        fr: clue,
        en: clueEn,
      },
      hintStatus,
      internationalisation,
    });
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}
