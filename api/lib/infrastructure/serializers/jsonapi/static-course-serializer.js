const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serializeSummary(staticCourseSummary, meta) {
    return new Serializer('static-course-summaries', {
      attributes: [
        'name',
        'createdAt',
        'challengeCount',
        'isActive',
      ],
      meta,
    }).serialize(staticCourseSummary);
  },

  serialize(staticCourse) {
    return new Serializer('static-courses', {
      attributes: [
        'name',
        'description',
        'isActive',
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
    }).serialize(staticCourse);
  }
};
