import Jsonapi from 'jsonapi-serializer';
import { Tube } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('tube', {
  attributes: [
    'pixId',
    'name',
    'practicalTitleFr',
    'practicalTitleEn',
    'practicalDescriptionFr',
    'practicalDescriptionEn',
    'index',
    'competence',
    'theme',
    'rawSkills',
  ],
  transform({
    id,
    airtableId,
    practicalTitle_i18n,
    practicalDescription_i18n,
    thematicAirtableId,
    competenceAirtableId,
    skillAirtableIds,
    ...thematic
  }) {
    return {
      ...thematic,
      id: airtableId,
      pixId: id,
      practicalTitleFr: practicalTitle_i18n.fr,
      practicalTitleEn: practicalTitle_i18n.en,
      practicalDescriptionFr: practicalDescription_i18n.fr,
      practicalDescriptionEn: practicalDescription_i18n.en,
      theme: thematicAirtableId && { id: thematicAirtableId },
      competence: competenceAirtableId && { id: competenceAirtableId },
      rawSkills: skillAirtableIds?.map((id) => ({ id })),
    };
  },
  theme: { ref: 'id' },
  competence: { ref: 'id' },
  rawSkills: { ref: 'id' },
  typeForAttribute(attribute) {
    if (attribute === 'rawSkills') return 'skills';
  },
});

export function serialize(tubes) {
  return serializer.serialize(tubes);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  themes: {
    valueForRelationship({ id }) {
      return id;
    },
  },
  transform({
    id,
    theme: thematicAirtableId,
    practicalTitleFr,
    practicalTitleEn,
    practicalDescriptionFr,
    practicalDescriptionEn,
    ...tube
  }) {
    return new Tube({
      ...tube,
      airtableId: id,
      practicalTitle_i18n: {
        fr: practicalTitleFr,
        en: practicalTitleEn,
      },
      practicalDescription_i18n: {
        fr: practicalDescriptionFr,
        en: practicalDescriptionEn,
      },
      thematicAirtableId,
    });
  },
});

export function deserialize(tubes) {
  return deserializer.deserialize(tubes);
}
