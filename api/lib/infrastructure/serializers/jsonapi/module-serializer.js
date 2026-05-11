import Jsonapi from 'jsonapi-serializer';

import { Module } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  transform(moduleDto) {
    return new Module(moduleDto);
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}

const serializer = new Serializer('module', {
  attributes: [
    'shortId',
    'slug',
    'title',
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
