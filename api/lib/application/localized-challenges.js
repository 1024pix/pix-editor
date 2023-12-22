import { localizedChallengeRepository } from '../infrastructure/repositories/index.js';
import { localizedChallengeSerializer } from '../infrastructure/serializers/jsonapi/index.js';

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
  ]);
}

export const name = 'localized-challenges-api';
