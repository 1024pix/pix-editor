import Jsonapi from 'jsonapi-serializer';
import { Note } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

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

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  transform(note) {
    return new Note(note);
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}
