import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

export function serialize(modules, meta) {
  const serializer = new Serializer('module-summary', {
    attributes: [
      'title',
      'isBeta',
      'visibility',
      'level',
    ],
    meta,
    transform({ details, ...module }) {
      return { ...module, ...details };
    },
  });
  return serializer.serialize(modules);
}
