import JsonapiSerializer from 'jsonapi-serializer';
import { Mission } from '../../../domain/models/index.js';

const { Serializer } = JsonapiSerializer;

export function serializeMissionSummary(mission, meta) {
  return new Serializer('mission-summary', {
    attributes: [
      'name',
      'competence',
      'thematicIds',
      'learningObjectives',
      'validatedObjectives',
      'introductionMedia',
      'createdAt',
      'status'
    ],
    meta,
  }).serialize(mission);
}
export function serializeMission(mission) {
  return new Serializer('mission', {
    transform: (mission) => {
      return {
        ...mission,
        name: mission.name_i18n.fr,
        learningObjectives: mission.learningObjectives_i18n.fr,
        validatedObjectives: mission.validatedObjectives_i18n.fr
      };
    },
    attributes: [
      'name',
      'competenceId',
      'thematicIds',
      'learningObjectives',
      'validatedObjectives',
      'introductionMedia',
      'createdAt',
      'status'
    ],

  }).serialize(mission);
}

export function serializeMissionId(id) {
  return new Serializer('mission', {}).serialize({ id });
}

export function deserializeMission(attributes) {
  return new Mission({
    id: attributes.id,
    name_i18n: { fr: attributes.name  },
    competenceId: attributes['competence-id'],
    thematicIds: attributes['thematic-ids'],
    learningObjectives_i18n:  { fr:  attributes['learning-objectives'] },
    validatedObjectives_i18n: { fr:  attributes['validated-objectives'] },
    introductionMedia: attributes['introduction-media'],
    status: attributes.status,
  });
}
