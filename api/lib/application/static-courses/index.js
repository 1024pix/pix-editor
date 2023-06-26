const staticCourseController = require('./static-courses');
exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/static-course-summaries',
      config: {
        handler: staticCourseController.findStaticCourseSummaries,
      },
    }
  ]);
};

exports.name = 'static-courses-api';
