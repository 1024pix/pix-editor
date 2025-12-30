import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

export function serialize(entities, meta) {
  const serializer = new Serializer('admin-entity', {
    attributes: ['properties'],
    meta,
    transform({ id, type, entityName, ...properties }) {
      return {
        id: `${entityName}:${id}`,
        type,
        properties: {
          id,
          ...properties,
        },
      };
    },
  });
  return serializer.serialize(entities);
}
