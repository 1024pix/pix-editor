import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const defaultAttributes = [
  'internalTitle',
  'shortId',
  'slug',
  'title',
  'isBeta',
  'visibility',
  'details',
  'sections',
  'glossary',
];

export function serialize(module, { attributes = defaultAttributes, meta } = {}) {
  const serializer = new Serializer('module', { attributes, meta });
  return serializer.serialize(module);
}
