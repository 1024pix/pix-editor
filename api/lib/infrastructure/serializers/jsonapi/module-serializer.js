import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('module', {
  attributes: [
    'internalTitle',
    'shortId',
    'slug',
    'title',
    'isBeta',
    'visibility',
    'details',
    'sections',
    'glossary',
  ],
});

export function serialize(module) {
  return serializer.serialize(module);
}
