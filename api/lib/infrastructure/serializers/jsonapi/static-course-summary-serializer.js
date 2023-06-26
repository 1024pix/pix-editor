const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serializeFromPaginatedStaticCourses(staticCourse, meta) {

    return new Serializer('static-course-summaries', {
      attributes: [
        'name',
        'createdAt',
        'challengeCount',
      ],
      transform(staticCourse) {
        return {
          id: staticCourse.id,
          name: staticCourse.name,
          createdAt: staticCourse.createdAt,
          challengeCount: staticCourse.challengeCount(),
        };
      },
      meta,
    }).serialize(staticCourse);
  },

};
