const staticCourseController = require('./static-courses');
const securityPreHandlers = require('../security-pre-handlers');

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
    },
    {
      method: 'POST',
      path: '/api/static-courses',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: staticCourseController.create,
      },
    },
    {
      method: 'PUT',
      path: '/api/static-courses/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: staticCourseController.update,
      },
    },
    {
      method: 'PUT',
      path: '/api/static-courses/{id}/deactivate',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: staticCourseController.deactivate,
      },
    },
  ]);
};

exports.name = 'static-courses-api';
