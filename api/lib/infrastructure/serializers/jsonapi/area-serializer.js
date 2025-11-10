import Jsonapi from 'jsonapi-serializer';
import { Area } from '../../../domain/models/index.js';

const { Deserializer, Serializer } = Jsonapi;

const serializer = new Serializer('area', {
  attributes: [
    'pixId',
    'code',
    'name',
    'titleFrFr',
    'titleEnUs',
    'framework',
    'competences',
  ],
  transform({ id, airtableId, title_i18n, name, frameworkId, competenceAirtableIds, ...area }) {
    return {
      ...area,
      id: airtableId,
      pixId: id,
      titleFrFr: title_i18n.fr,
      titleEnUs: title_i18n.en,
      name,
      framework: frameworkId && { id: frameworkId },
      competences: competenceAirtableIds?.map((id) => ({ id })),
    };
  },
  framework: { ref: 'id' },
  competences: { ref: 'id' },
});

export function serialize(areas) {
  return serializer.serialize(areas);
}

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
  frameworks: {
    valueForRelationship({ id }) {
      return id;
    },
  },
  transform({ titleFrFr, titleEnUs, framework: frameworkId }) {
    return new Area({
      title_i18n: {
        fr: titleFrFr,
        en: titleEnUs,
      },
      frameworkId,
    });
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}
