import Jsonapi from 'jsonapi-serializer';
import { ChangelogEntry } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('changelog-entry', {
  attributes: [
    'status',
    'text',
    'author',
    'elementId',
    'elementType',
    'createdAt',
  ],
});

export function serialize(changelogEntries) {
  return serializer.serialize(changelogEntries);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  transform(changelogEntry) {
    return new ChangelogEntry(changelogEntry);
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}
