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
];

export function serialize(draftModules, { meta, attributes = defaultAttributes } = {}) {
  const serializer = new Serializer('draft-module', {
    attributes,
    meta,
    transform({ moduleId, ...draftModule }) {
      return {
        ...draftModule,
        module: moduleId ? { id: moduleId } : null,
      };
    },
    module: {
      ref: 'id',
      included: false,
    },
  });
  return serializer.serialize(draftModules);
}
