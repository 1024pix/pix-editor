import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('module-summary', {
  attributes: [
    'title',
    'isBeta',
    'visibility',
    'level',
  ],
  transform({ details, ...module }) {
    return { ...module, ...details };
  },
});

export function serialize(frameworks) {
  return serializer.serialize(frameworks);
}
