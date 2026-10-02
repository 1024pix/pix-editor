import * as securityPreHandlers from '../security-pre-handlers.js';
import * as brokenUrlSerializer from '../../infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { brokenUrlRepository } from '../../infrastructure/repositories/index.js';
import { brokenUrlId } from '../types.js';
import Joi from 'joi';
import { logger } from '../../infrastructure/logger.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/broken-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const brokenUrlList = await brokenUrlRepository.list();
          return h.response(brokenUrlSerializer.serialize(brokenUrlList));
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/broken-urls/{brokenUrlId}',
      config: {
        validate: {
          params: Joi.object({ brokenUrlId: brokenUrlId() }),
          payload: Joi.object({ ignored: Joi.boolean() }).unknown(true),
        },
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const { brokenUrlId } = request.params;
          const { ignored } = await brokenUrlSerializer.deserialize(request.payload);

          const hasUpdated = await brokenUrlRepository.updateIgnoredById(brokenUrlId, ignored);
          if (!hasUpdated) {
            logger.info({ brokenUrlId, ignored }, 'Could not update broken url');
            return h.response().code(400);
          }

          return h.response().code(200);
        },
      },
    },
  ]);
}

export const name = 'broken-urls';
