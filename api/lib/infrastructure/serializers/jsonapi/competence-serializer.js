import Jsonapi from 'jsonapi-serializer';
import { Competence } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('competence', {
  attributes: [
    'pixId',
    'code',
    'title',
    'titleEn',
    'description',
    'descriptionEn',
    'source',
    'area',
    'rawThemes',
    'rawTubes',
  ],
  transform({
    id,
    airtableId,
    index,
    name_i18n,
    description_i18n,
    origin,
    areaAirtableId,
    thematicAirtableIds,
    tubeAirtableIds,
    ...competence
  }) {
    return {
      ...competence,
      id: airtableId,
      pixId: id,
      code: index,
      title: name_i18n.fr,
      titleEn: name_i18n.en,
      description: description_i18n.fr,
      descriptionEn: description_i18n.en,
      source: origin,
      area: {
        id: areaAirtableId,
      },
      rawThemes: thematicAirtableIds?.map((airtableThematicId) => ({
        id: airtableThematicId,
      })),
      rawTubes: tubeAirtableIds?.map((airtableTubeId) => ({
        id: airtableTubeId,
      })),
    };
  },
  typeForAttribute(attribute) {
    if (attribute === 'rawThemes') return 'themes';
    if (attribute === 'rawTubes') return 'tubes';
  },
  area: {
    ref: 'id',
  },
  rawThemes: {
    ref: 'id',
  },
  rawTubes: {
    ref: 'id',
  },
});

export function serialize(areas) {
  return serializer.serialize(areas);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  areas: {
    valueForRelationship({ id }) {
      return id;
    },
  },
  transform({ title, titleEn, description, descriptionEn, area: areaAirtableId }) {
    return new Competence({
      name_i18n: {
        fr: title,
        en: titleEn,
      },
      description_i18n: {
        fr: description,
        en: descriptionEn,
      },
      areaAirtableId,
    });
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}
