import Boom from '@hapi/boom';

import * as securityPreHandlers from '../security-pre-handlers.js';
import { fileStorageTokenRepository } from '../../infrastructure/repositories/index.js';

export async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/file-storage-token',
      config: {
        pre: [
          { method: securityPreHandlers.checkUserHasWriteAccess },
        ],
        handler: async function(request, h) {
          try {
            const token = await fileStorageTokenRepository.create();
            return h.response({ token: token.value });
          } catch (error) {
            return Boom.boomify(error, { statusCode: error.response.status });
          }
        },
      }
    },
  ]);
}

export const name = 'file-storage-token-api';
