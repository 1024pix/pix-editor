import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

export function serializeMissionSummary(mission, meta) {
  return new Serializer('mission-summary', {
    attributes: [
      'name',
      'competence',
      'thematicId',
      'learningObjectives',
      'validatedObjectives',
      'isActive',
      'createdAt',
      'status'
    ],
    meta,
  }).serialize(mission);
}
