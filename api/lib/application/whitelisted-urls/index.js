import Joi from 'joi';
import * as securityPreHandlers from '../security-pre-handlers.js';
import { Types } from '../types.js';
import { whitelistedUrlReadRepository, whitelistedUrlRepository } from '../../infrastructure/repositories/index.js';
import * as whitelistedUrlSerializer from '../../infrastructure/serializers/jsonapi/whitelisted-url-serializer.js';
import { NotFoundWhitelistedUrlError } from '../../domain/errors.js';
import { WhitelistedUrl } from '../../domain/models/index.js';

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
    },
    {
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
            throw new NotFoundWhitelistedUrlError(`L'URL d'id ${whitelistedUrlId} n'existe pas`);
          }
          whitelistedUrlToDelete.canDelete(authenticatedUser);
          whitelistedUrlToDelete.delete(authenticatedUser);
          await whitelistedUrlRepository.save(whitelistedUrlToDelete);
          return h.response().code(204);
        },
      },
    },
    {
      method: 'POST',
      path: '/api/whitelisted-urls',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const authenticatedUser = request.auth.credentials.user;
          const attributes = request.payload.data.attributes;
          const creationCommand = {
            url: attributes['url'] ?? null,
            relatedSkillNames: attributes['related-skill-names'] ?? null,
            comment: attributes['comment'] ?? null,
            checkType: attributes['check-type'] ?? null,
          };
          const existingWhitelistedUrls = await whitelistedUrlRepository.list();
          WhitelistedUrl.canCreate(creationCommand, authenticatedUser, existingWhitelistedUrls);
          const whitelistedUrlToCreate = WhitelistedUrl.create(creationCommand, authenticatedUser);
          const id = await whitelistedUrlRepository.save(whitelistedUrlToCreate);
          const createdWhitelistedUrl_read = await whitelistedUrlReadRepository.find(id);
          return h.response(whitelistedUrlSerializer.serialize(createdWhitelistedUrl_read)).created();
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/whitelisted-urls/{whitelistUrlId}',
      config: {
        validate: {
          params: Joi.object({
            whitelistUrlId: Types.whitelistedUrlId().required(),
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        handler: async function(request, h) {
          const authenticatedUser = request.auth.credentials.user;
          const attributes = request.payload.data.attributes;
          const whitelistedUrlId = request.params.whitelistUrlId;
          const updateCommand = {
            url: attributes['url'] ?? null,
            relatedSkillNames: attributes['related-skill-names'] ?? null,
            comment: attributes['comment'] ?? null,
            checkType: attributes['check-type'] ?? null,
          };
          const whitelistedUrlToUpdate = await whitelistedUrlRepository.find(whitelistedUrlId);
          if (!whitelistedUrlToUpdate) {
            throw new NotFoundWhitelistedUrlError(`L'URL d'id ${whitelistedUrlId} n'existe pas`);
          }
          const existingWhitelistedUrls = await whitelistedUrlRepository.list();
          whitelistedUrlToUpdate.canUpdate(updateCommand, authenticatedUser, existingWhitelistedUrls);
          whitelistedUrlToUpdate.update(updateCommand, authenticatedUser);
          await whitelistedUrlRepository.save(whitelistedUrlToUpdate);
          const updatedWhitelistedUrl = await whitelistedUrlReadRepository.find(whitelistedUrlId);
          return h.response(whitelistedUrlSerializer.serialize(updatedWhitelistedUrl));
        },
      },
    },
  ]);
}

export const name = 'whitelisted-urls';
