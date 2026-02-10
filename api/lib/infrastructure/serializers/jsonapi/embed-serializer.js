import JsonapiSerializer from 'jsonapi-serializer';

import { Embed } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = JsonapiSerializer;

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  transform(embedDto) {
    return new Embed(embedDto);
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}

const serializer = new Serializer('embed', { attributes: ['name', 'pathname'] });

export function serialize(embed) {
  return serializer.serialize(embed);
}
