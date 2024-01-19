import JsonapiSerializer from 'jsonapi-serializer';
import { Mission } from '../../../domain/models/index.js';

const { Serializer } = JsonapiSerializer;

export function serializeMissionSummary(mission, meta) {
  return new Serializer('mission-summary', {
    attributes: [
      'name',
      'competence',
      'thematicId',
      'learningObjectives',
      'validatedObjectives',
      'createdAt',
      'status'
    ],
    meta,
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
    thematicId: attributes['thematic-id'],
    learningObjectives_i18n:  { fr:  attributes['learning-objectives'] },
    validatedObjectives_i18n: { fr:  attributes['validated-objectives'] },
    status: attributes.status,
  });
}
