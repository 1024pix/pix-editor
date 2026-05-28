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
];

export function serialize(modules, { meta, attributes = defaultAttributes } = {}) {
  const serializer = new Serializer('draft-module', {
    attributes,
    meta,
  });
  return serializer.serialize(modules);
}
