import Jsonapi from 'jsonapi-serializer';
import { Tag } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('tag', {
  attributes: [
    'pixId',
    'title',
  ],
  transform(tag) {
    return {
      id: tag.airtableId,
      pixId: tag.id,
      title: tag.title,
    };
  },
});

export function serialize(thematics) {
  return serializer.serialize(thematics);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  transform(tag) {
    return new Tag({
      ...tag,
      id: null,
      airtableId: tag.id ?? null,
    });
  }
});

export function deserialize(tags) {
  return deserializer.deserialize(tags);
}
