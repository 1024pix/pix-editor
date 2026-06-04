import Jsonapi from 'jsonapi-serializer';

import { DraftModule } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  transform(draftModuleDto) {
    return new DraftModule(draftModuleDto);
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}

const defaultAttributes = [
  'shortId',
  'slug',
  'title',
  'internalTitle',
  'isBeta',
  'visibility',
  'details',
  'sections',
  'glossary',
  'module',
  'diff',
];

export function serialize(draftModules, { meta, attributes = defaultAttributes } = {}) {
  const serializer = new Serializer('draft-module', {
    attributes,
    meta,
    transform({ moduleId, ...draftModule }) {
      const data = {
        ...draftModule,
        module: moduleId ? { id: moduleId } : null,
      };
      if (moduleId) data.diff = {};
      return data;
    },
    module: {
      ref: 'id',
      included: false,
    },
    diff: {
      ref: 'id',
      ignoreRelationshipData: true,
      relationshipLinks: {
        related({ id }) {
          return `/api/draft-modules/${id}/diff`;
        },
      },
    },
  });
  return serializer.serialize(draftModules);
}
