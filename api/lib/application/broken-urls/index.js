import * as securityPreHandlers from '../security-pre-handlers.js';
import * as brokenUrlSerializer from '../../infrastructure/serializers/jsonapi/broken-url-serializer.js';
import { brokenUrlReadRepository } from '../../infrastructure/repositories/index.js';
import { getBrokenUrlList } from '../../domain/usecases/index.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/broken-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const rawBrokenUrls = await brokenUrlReadRepository.list();
          //   const brokenUrlList = await getBrokenUrlList();
          return h.response(brokenUrlSerializer.serialize(rawBrokenUrls));
        },
      },
    },
  ]);
}

export const name = 'broken-urls';
