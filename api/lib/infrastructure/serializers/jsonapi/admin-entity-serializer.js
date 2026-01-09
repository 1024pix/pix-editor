import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

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

const ID_GENERATORS = {
  translations(translation) {
    return `${translation.locale}:${translation.key}`;
  },
};
