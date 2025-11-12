import { extractParameters } from '../infrastructure/utils/query-params-utils.js';
import * as noteRepository from '../infrastructure/repositories/note-repository.js';
import * as noteSerializer from '../infrastructure/serializers/jsonapi/note-serializer.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/notes',
      config: {
        handler: async function(request) {
          const params = extractParameters(request.query);
          const notes = await noteRepository.listByChallengeId(params.filter.challengeId);
          return noteSerializer.serialize(notes);
        },
      },
    },
  ]);
}

export const name = 'notes';
