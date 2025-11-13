import { extractParameters } from '../infrastructure/utils/query-params-utils.js';
import * as changelogEntryRepository from '../infrastructure/repositories/changelog-entry-repository.js';
import * as changelogEntrySerializer from '../infrastructure/serializers/jsonapi/changelog-entry-serializer.js';

export function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/changelog-entries',
      config: {
        handler: async function(request) {
          const params = extractParameters(request.query);
          const changelogEntries = await changelogEntryRepository.listByElementId(params.filter.elementId);
          return changelogEntrySerializer.serialize(changelogEntries);
        },
      },
    },
    {
      method: 'POST',
      path: '/api/changelog-entries',
      config: {
        handler: async function(request, h) {
          const changelogEntryToCreate = await changelogEntrySerializer.deserialize(request.payload);
          const changelogEntry = await changelogEntryRepository.create(changelogEntryToCreate);
          return h.response(changelogEntrySerializer.serialize(changelogEntry)).created();
        },
      },
    },
  ]);
}

export const name = 'changelog-entries';
