import * as securityPreHandlers from '../security-pre-handlers.js';
import * as brokenUrlSerializer from '../../infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { getBrokenUrlList } from '../../domain/usecases/index.js';

// retourner les brokenurls
// associées aux infos de challenges / tutorials

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/broken-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const brokenUrlList = await getBrokenUrlList();
          return h.response(brokenUrlSerializer.serialize(brokenUrlList));
        },
      },
    },
  ]);
}

export const name = 'broken-urls';
