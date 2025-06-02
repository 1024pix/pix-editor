import Jsonapi from 'jsonapi-serializer';
import { Tag } from '../../../domain/models/Tag.js';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('tags', {
  attributes: [
    'title',
    'description',
    'notes',
    'skills',
    'tutorials',
  ],
  skills: {
    ref: 'id',
  },
  tutorials: {
    ref: 'id',
  },
  transform(tag) {
    return {
      id: tag.airtableId,
      title: tag.title,
      description: tag.description,
      notes: tag.notes,
      skills: { id: tag.skillAirtableId },
      tutorials: tag.tutorialAirtableIds?.map((id) => ({ id })),
    };
  },
});

export function serialize(tagOrTags) {
  return serializer.serialize(tagOrTags);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  skills: {
    valueForRelationship(relationship) {
      return relationship.id;
    },
  },
  tutorials: {
    valueForRelationship({ id }) {
      return id;
    },
  },
  transform(deserializedJsonApiData) {
    return new Tag({
      title: deserializedJsonApiData.title,
      description: deserializedJsonApiData.description,
      notes: deserializedJsonApiData.notes,
      skillAirtableId: deserializedJsonApiData.skills,
      tutorialAirtableIds: deserializedJsonApiData.tutorials,
      airtableId: deserializedJsonApiData.id,
    });
  }
});

export async function deserialize(payload) {
  return deserializer.deserialize(payload);
}
