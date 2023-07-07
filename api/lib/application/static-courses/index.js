const staticCourseController = require('./static-courses');
exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/static-course-summaries',
      config: {
        handler: staticCourseController.findSummaries,
      },
    },
    {
      method: 'GET',
      path: '/api/static-courses/{id}',
      config: {
        handler: staticCourseController.get,
      },
    }
  ]);
};

exports.name = 'static-courses-api';
