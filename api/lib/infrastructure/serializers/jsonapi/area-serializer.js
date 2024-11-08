import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('area', {
  attributes: [
    'pixId',
    'code',
    'titleFrFr',
    'titleEnUs',
    'framework',
    'competences',
  ],
  transform({ id, frameworkId, title_i18n, competenceAirtableIds, airtableId, ...area }) {
    return {
      ...area,
      id: airtableId,
      pixId: id,
      titleFrFr: title_i18n.fr,
      titleEnUs: title_i18n.en,
      framework: frameworkId && { id: frameworkId },
      competences: competenceAirtableIds?.map((id) => ({ id })),
    };
  },
  framework: {
    ref: 'id',
  },
  competences: {
    ref: 'id',
  },
});

export function serialize(areas) {
  return serializer.serialize(areas);
}
