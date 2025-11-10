import Jsonapi from 'jsonapi-serializer';
import { Tutorial } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('tutorial', {
  attributes: [
    'pixId',
    'title',
    'duration',
    'source',
    'format',
    'link',
    'license',
    'level',
    'crush',
    'language',
    'tags',
  ],
  transform(tutorial) {
    return {
      id: tutorial.airtableId,
      pixId: tutorial.id,
      title: tutorial.title,
      duration: tutorial.duration,
      source: tutorial.source,
      format: tutorial.format,
      link: tutorial.link,
      license: tutorial.license,
      level: tutorial.level,
      crush: tutorial.crush,
      language: tutorial.locale,
      tags: tutorial.tagAirtableIds.map((tagAirtableId) => ({ id: tagAirtableId })),
    };
  },
  tags: { ref: 'id' },
});

export function serialize(thematics) {
  return serializer.serialize(thematics);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  tags: {
    valueForRelationship({ id }) {
      return id;
    },
  },
  transform(tutorial) {
    return new Tutorial({
      ...tutorial,
      locale: tutorial.language,
      id: tutorial.pixId,
      airtableId: tutorial.id ?? null,
      tagAirtableIds: tutorial.tags,
    });
  },
});

export function deserialize(tags) {
  return deserializer.deserialize(tags);
}
