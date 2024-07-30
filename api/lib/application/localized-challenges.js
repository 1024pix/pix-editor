import { localizedChallengeRepository } from '../infrastructure/repositories/index.js';
import { localizedChallengeSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import { hasAuthenticatedUserAccess, replyForbiddenError } from './security-utils.js';
import { modifyLocalizedChallenge } from '../domain/usecases/index.js';
import { ForbiddenError } from '../domain/errors.js';
import Joi from 'joi';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/localized-challenges/{id}',
      config: {
        handler: async function(request) {
          const localizedChallengeId = request.params.id;
          const localizedChallenge = await localizedChallengeRepository.get({ id: localizedChallengeId });
          return localizedChallengeSerializer.serialize(localizedChallenge);
        }
      },
    },
    {
      method: 'GET',
      path: '/api/localized-challenges',
      config: {
        validate: {
          query: Joi.object({
            filter: Joi.object({
              ids: Joi.array().items(Joi.string()).default([])
            }).default({ ids: [] }),
          })
        }, handler: async function(request) {
          const localizedChallenges = await localizedChallengeRepository.getMany({ ids: request.query.filter.ids });
          return localizedChallengeSerializer.serialize(localizedChallenges);
        }
      },
    },
    {
      method: 'PATCH',
      path: '/api/localized-challenges/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const { locale: _, ...localizedChallenge } = await localizedChallengeSerializer.deserialize(request.payload);
          const isAdmin = hasAuthenticatedUserAccess(request, ['admin']);
          try {
            const updatedLocalizedChallenge = await modifyLocalizedChallenge({
              isAdmin,
              localizedChallenge
            }, { localizedChallengeRepository });
            return h.response(localizedChallengeSerializer.serialize(updatedLocalizedChallenge));
          } catch (error) {
            if (error instanceof ForbiddenError) {
              return replyForbiddenError(h, error);
            }
            throw error;
          }
        },
      },
    },
  ]);
}

export const name = 'localized-challenges-api';
