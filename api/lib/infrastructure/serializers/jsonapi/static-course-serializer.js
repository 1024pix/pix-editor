import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

export function serializeSummary(staticCourseSummary, meta) {
  return new Serializer('static-course-summaries', {
    attributes: [
      'name',
      'createdAt',
      'challengeCount',
      'isActive',
    ],
    meta,
  }).serialize(staticCourseSummary);
}

const serializer = new Serializer('static-courses', {
  attributes: [
    'name',
    'description',
    'isActive',
    'deactivationReason',
    'createdAt',
    'updatedAt',
    'challengeSummaries',
  ],
  challengeSummaries: {
    ref: 'id',
    included: true,
    attributes: ['instruction', 'skillName', 'status', 'index', 'previewUrl'],
  },
  typeForAttribute(attribute) {
    if (attribute === 'challengeSummaries') return 'challenge-summaries';
  },
});

export function serialize(staticCourse) {
  return serializer.serialize(staticCourse);
}
