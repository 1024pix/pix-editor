import * as staticCourseTagsController from './static-course-tags.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/static-course-tags',
      config: {
        handler: staticCourseTagsController.list,
      },
    },
  ]);
}

export const name = 'static-course-tags';
