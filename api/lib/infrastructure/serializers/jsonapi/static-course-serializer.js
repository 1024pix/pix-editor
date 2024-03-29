import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

export function serializeSummary(staticCourseSummary, meta) {
  return new Serializer('static-course-summaries', {
    attributes: [
      'name',
      'createdAt',
      'challengeCount',
      'isActive',
      'tags',
    ],
    tags: {
      ref: 'id',
      included: true,
      attributes: ['label'],
    },
    meta,
    typeForAttribute(attribute) {
      if (attribute === 'tags') return 'static-course-tags';
      return undefined;
    },
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
    'tags'
  ],
  challengeSummaries: {
    ref: 'id',
    included: true,
    attributes: ['instruction', 'skillName', 'status', 'index', 'previewUrl'],
  },
  tags: {
    ref: 'id',
    included: true,
    attributes: ['label'],
  },
  typeForAttribute(attribute) {
    if (attribute === 'challengeSummaries') return 'challenge-summaries';
    if (attribute === 'tags') return 'static-course-tags';
  }
});

export function serialize(staticCourse) {
  return serializer.serialize(staticCourse);
}
