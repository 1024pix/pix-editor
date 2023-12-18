import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

export function serializeMission(mission, meta) {
  return new Serializer('mission', {
    attributes: [
      'name',
      'competence',
      'description',
      'thematicId',
      'learningObjectives',
      'validatedObjectives',
      'isActive',
      'createdAt',
      'status'
    ],
    meta,
    transform(mission) {
      mission.name = mission.name_i18n.fr;
      mission.learningObjectives = mission.learningObjectives_i18n.fr;
      mission.validatedObjectives = mission.validatedObjectives_i18n.fr;
      return mission;
    }

  }).serialize(mission);
}
