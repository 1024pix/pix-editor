import Joi from 'joi';
import * as securityPreHandlers from '../security-pre-handlers.js';
import * as whitelistedUrlRepository from '../../infrastructure/repositories/whitelisted-url-repository.js';
import * as whitelistedUrlSerializer from '../../infrastructure/serializers/jsonapi/whitelisted-url-serializer.js';
import Boom from '@hapi/boom';
import { WhitelistedUrl } from '../../domain/models/index.js';

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
            relatedEntityIds: attributes['related-entity-ids'] ?? null,
            comment: attributes['comment'] ?? null,
            checkType: attributes['check-type'] ?? null,
          };
          const existingWhitelistedUrls = await whitelistedUrlRepository.listRead();
          const canCreate = WhitelistedUrl.canCreate(creationCommand, authenticatedUser, existingWhitelistedUrls);
          if (canCreate.cannot) {
            return Boom.badData(canCreate.errorMessage);
          }
          const whitelistedUrlToCreate = WhitelistedUrl.create(creationCommand, authenticatedUser);
          const id = await whitelistedUrlRepository.save(whitelistedUrlToCreate);
          const createdWhitelistedUrl = await whitelistedUrlRepository.findRead(id);
          return h.response(whitelistedUrlSerializer.serialize(createdWhitelistedUrl)).created();
        },
      },
    },
    {
      method: 'PATCH',
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
          const attributes = request.payload.data.attributes;
          const whitelistedUrlId = request.params.whitelistUrlId;
          const updateCommand = {
            url: attributes['url'] ?? null,
            relatedEntityIds: attributes['related-entity-ids'] ?? null,
            comment: attributes['comment'] ?? null,
            checkType: attributes['check-type'] ?? null,
          };
          const whitelistedUrlToUpdate = await whitelistedUrlRepository.find(whitelistedUrlId);
          if (!whitelistedUrlToUpdate) {
            return Boom.notFound(`L'URL whitelistée d'id ${whitelistedUrlId} n'existe pas`);
          }
          const existingWhitelistedUrls = await whitelistedUrlRepository.listRead();
          const canUpdate = whitelistedUrlToUpdate.canUpdate(updateCommand, authenticatedUser, existingWhitelistedUrls);
          if (canUpdate.cannot) {
            return Boom.badData(canUpdate.errorMessage);
          }
          whitelistedUrlToUpdate.update(updateCommand, authenticatedUser);
          await whitelistedUrlRepository.save(whitelistedUrlToUpdate);
          const updatedWhitelistedUrl = await whitelistedUrlRepository.findRead(whitelistedUrlId);
          return h.response(whitelistedUrlSerializer.serialize(updatedWhitelistedUrl));
        },
      },
    },
  ]);
}

export const name = 'whitelisted-urls';
