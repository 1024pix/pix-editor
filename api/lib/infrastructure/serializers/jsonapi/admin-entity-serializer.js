import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

export function serialize(entities, meta) {
  const serializer = new Serializer('admin-entity', {
    attributes: ['properties'],
    meta,
    transform({ id, type, entityName, ...properties }) {
      let entityId = id;
      if (ENTITIES_WITH_UNUSUAL_IDS.includes(entityName)) {
        entityId = ID_GENERATORS[entityName](properties);
      }

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

const ENTITIES_WITH_UNUSUAL_IDS = Object.keys(ID_GENERATORS);
