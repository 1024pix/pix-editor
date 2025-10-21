import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('admin-schema', {
  attributes: [
    'id',
    'label',
    'editable',
    'deletable',
    'creatable',
    'fields',
  ],
});

export function serialize(schemas) {
  return serializer.serialize(schemas);
}
