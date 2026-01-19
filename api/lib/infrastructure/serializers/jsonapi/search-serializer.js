import Jsonapi from 'jsonapi-serializer';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('search-result', {
  attributes: [
    'title',
    'status',
    'type',
    'locale',
    'isPrimary',
    'version',
  ],
});

export function serialize(payload) {
  return serializer.serialize(payload);
}

const deserializer = new Deserializer({});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}
