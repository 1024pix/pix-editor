import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('admin-schema', {
  attributes: [
    'label',
    'entityName',
    'editable',
    'deletable',
    'creatable',
    'fields',
  ],
});

export function serialize(attachments) {
  return serializer.serialize(attachments);
}
