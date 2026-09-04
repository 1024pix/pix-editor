import * as securityPreHandlers from '../security-pre-handlers.js';
import * as brokenUrlSerializer from '../../infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { brokenUrlRepository } from '../../infrastructure/repositories/index.js';

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
  ]);
}

export const name = 'broken-urls';
