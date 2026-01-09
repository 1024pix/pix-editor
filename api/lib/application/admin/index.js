import Joi from 'joi';
import * as adminController from './admin-controller.js';
import * as securityPreHandlers from '../security-pre-handlers.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/schemas',
      config: {
        handler: adminController.getSchemas,
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        tags: ['api', 'admin'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/entities/{entityName}',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: adminController.getEntities,
        tags: ['api', 'admin'],
        validate: {
          params: Joi.object({ entityName: Joi.string().required() }).unknown(false),
          query: Joi.object({
            entityName: Joi.string().optional().description('Redundant but still sent by Ember Data'),
            'page[size]': Joi.number().min(1).max(100).optional(),
            'page[number]': Joi.number().min(1).max(999_999).optional(),
          }).unknown(false),
        },
      },
    },
  ]);
}

export const name = 'admin-api';
