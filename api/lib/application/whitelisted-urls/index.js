import Joi from 'joi';
import * as securityPreHandlers from '../security-pre-handlers.js';
import { whitelistedUrlReadRepository, whitelistedUrlRepository } from '../../infrastructure/repositories/index.js';
import * as whitelistedUrlSerializer from '../../infrastructure/serializers/jsonapi/whitelisted-url-serializer.js';
import { NotFoundWhitelistedUrlError } from '../../domain/errors.js';
import { Types } from '../types.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/whitelisted-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const whitelistedUrls_read = await whitelistedUrlReadRepository.list();
          return h.response(whitelistedUrlSerializer.serialize(whitelistedUrls_read));
        },
      },
    },{
      method: 'DELETE',
      path: '/api/whitelisted-urls/{whitelistedUrlId}',
      config: {
        validate: {
          params: Joi.object({
            whitelistedUrlId: Types.whitelistedUrlId().required(),
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const authenticatedUser = request.auth.credentials.user;
          const whitelistedUrlId = request.params.whitelistedUrlId;
          const whitelistedUrlToDelete = await whitelistedUrlRepository.find(whitelistedUrlId);
          if (!whitelistedUrlToDelete) {
            throw new NotFoundWhitelistedUrlError(`L'URL whitelistée d'id ${whitelistedUrlId} n'existe pas`);
          }
          whitelistedUrlToDelete.canDelete(authenticatedUser);
          whitelistedUrlToDelete.delete(authenticatedUser);
          await whitelistedUrlRepository.save(whitelistedUrlToDelete);
          return h.response().code(204);
        },
      },
    },
  ]);
}

export const name = 'whitelisted-urls';
