import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('admin-entity', {
  attributes: [
    'id',
    'type',
    'properties',
  ],
  transform({ id, type, ...properties }) {
    return {
      id,
      type,
      properties: {
        id,
        ...properties,
      },
    };
  }
});

export function serialize(entities) {
  return serializer.serialize(entities);
}
