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

const serializer = new Serializer('draft-module', {
  attributes: [
    'shortId',
    'slug',
    'title',
    'internalTitle',
    'isBeta',
    'visibility',
    'details',
    'sections',
    'glossary',
  ],
});

export function serialize(module) {
  return serializer.serialize(module);
}
