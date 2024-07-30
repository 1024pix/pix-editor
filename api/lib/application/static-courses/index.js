import * as staticCourseController from './static-courses.js';
import * as securityPreHandlers from '../security-pre-handlers.js';
import Joi from 'joi';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/static-course-summaries',
      config: {
        validate: {
          query: Joi.object({
            page: Joi.object({
              number: Joi.number().integer().min(1).default(1),
              size: Joi.number().integer().min(1).max(100).default(10),
            }).default({
              number: 1,
              size: 10,
            }),
            filter: Joi.object({
              isActive: Joi.boolean().default(false),
              name: Joi.string().trim().empty('').allow(null).default(null),
            }).default({
              isActive: null,
              name: null,
            })
          }),
        },
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
    {
      method: 'PUT',
      path: '/api/static-courses/{id}/reactivate',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: staticCourseController.reactivate,
      },
    },
  ]);
}

export const name = 'static-courses-api';
