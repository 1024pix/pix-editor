import * as securityPreHandlers from '../security-pre-handlers.js';
import { urlRepository } from '../../infrastructure/repositories/index.js';
import * as externalUrlsSerializer from '../../infrastructure/serializers/html/external-urls-serializer.js';
import { urlBrokenLinksMonitor } from '../../config.js';
import Joi from 'joi';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/external-urls',
      config: {
        auth: false,
        pre: [{ method: securityPreHandlers.checkUserIsUrlBrokenLinksMonitor }],
        validate: { query: Joi.object({ page: Joi.number().required() }) },
        handler: async function(request, h) {
          const externalUrls = await urlRepository.getWithPagination({
            number: request.query.page,
            size: urlBrokenLinksMonitor.pageSize,
          });
          return h.response(externalUrlsSerializer.serialize(externalUrls));
        },
      },
    },
  ]);
}

export const name = 'external-urls';
