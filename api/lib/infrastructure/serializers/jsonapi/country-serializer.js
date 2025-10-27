import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('country', {
  attributes: ['code', 'name'],
});

export function serialize(config) {
  return serializer.serialize(config);
}
