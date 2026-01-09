import Jsonapi from 'jsonapi-serializer';

const { Deserializer, Serializer } = Jsonapi;

export function serialize(entities, meta) {
  const serializer = new Serializer('admin-entity', {
    attributes: ['properties'],
    meta,
    transform({ id, type, entityName, ...properties }) {
      const entityId = id ?? ID_GENERATORS[entityName]?.(properties);

      return {
        id: `${entityName}:${entityId}`,
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

export async function deserialize(entity) {
  const deserializer = new Deserializer({
    keyForAttribute: 'camelCase',
    transform(entity) {
      return entity;
    },
  });

  const data = await deserializer.deserialize(entity);
  return data.properties;
}

const ID_GENERATORS = {
  translations(translation) {
    return `${translation.locale}:${translation.key}`;
  },
};
