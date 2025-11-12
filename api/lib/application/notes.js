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
    {
      method: 'POST',
      path: '/api/notes',
      config: {
        handler: async function(request, h) {
          const noteToCreate = await noteSerializer.deserialize(request.payload);
          const notes = await noteRepository.create(noteToCreate);
          return h.response(noteSerializer.serialize(notes)).created();
        },
      },
    },
  ]);
}

export const name = 'notes';
