import Joi from 'joi';
import * as securityPreHandlers from '../security-pre-handlers.js';
import * as whitelistedUrlRepository from '../../infrastructure/repositories/whitelisted-url-repository.js';
import * as whitelistedUrlSerializer from '../../infrastructure/serializers/jsonapi/whitelisted-url-serializer.js';
import Boom from '@hapi/boom';

const whitelistedUrlIdentifierType = Joi.number().integer().min(1);

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/whitelisted-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const whitelistedUrls = await whitelistedUrlRepository.listRead();
          return h.response(whitelistedUrlSerializer.serialize(whitelistedUrls));
        },
      },
    },
    {
      method: 'DELETE',
      path: '/api/whitelisted-urls/{whitelistUrlId}',
      config: {
        validate: {
          params: Joi.object({
            whitelistUrlId: whitelistedUrlIdentifierType,
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const authenticatedUser = request.auth.credentials.user;
          const whitelistedUrlId = request.params.whitelistUrlId;
          const whitelistedUrlToDelete = await whitelistedUrlRepository.find(whitelistedUrlId);
          if (!whitelistedUrlToDelete) {
            return Boom.notFound(`L'URL whitelistée d'id ${whitelistedUrlId} n'existe pas`);
          }
          const canDelete = whitelistedUrlToDelete.canDelete(authenticatedUser);
          if (canDelete.cannot) {
            return Boom.badData(canDelete.errorMessage);
          }
          whitelistedUrlToDelete.delete(authenticatedUser);
          await whitelistedUrlRepository.save(whitelistedUrlToDelete);
          return h.response().code(204);
        },
      },
    },
  ]);
}

export const name = 'whitelisted-urls';
