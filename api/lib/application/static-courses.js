const staticCourseRepository = require('../infrastructure/repositories/static-course-repository');
const staticCourseSerializer = require('../infrastructure/serializers/jsonapi/static-course-serializer');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/static-course-summaries',
      config: {
        handler: async function(request, h) {
          try {
            const staticCourses = await staticCourseRepository.findStaticCourses();
            return h.response(staticCourseSerializer.serialize(staticCourses));
          } catch (err) {
            console.log(err);
            return h.response().code(500);
          }

        },
      },
    }
  ]);
};

exports.name = 'static-courses-api';
