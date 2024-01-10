import { localizedChallengeRepository } from '../infrastructure/repositories/index.js';
import { localizedChallengeSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import * as securityPreHandlers from './security-pre-handlers.js';
import { extractParameters } from '../infrastructure/utils/query-params-utils.js';
import { hasAuthenticatedUserAccess, replyForbiddenError } from './security-utils.js';

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
        handler: async function(request) {
          const params = extractParameters(request.query);
          const localizedChallenges = await localizedChallengeRepository.getMany({ ids: params.filter.ids });
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

          if (localizedChallenge.status !== undefined && !hasAuthenticatedUserAccess(request, 'admin')) {
            return replyForbiddenError(h);
          }

          const updatedLocalizedChallenge = await localizedChallengeRepository.update({ localizedChallenge });
          return h.response(localizedChallengeSerializer.serialize(updatedLocalizedChallenge));
        },
      },
    },
  ]);
}

export const name = 'localized-challenges-api';
