import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('note', {
  attributes: [
    'status',
    'text',
    'author',
    'createdAt',
  ],
});

export function serialize(notes) {
  return serializer.serialize(notes);
}
