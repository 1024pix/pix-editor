import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('theme', {
  attributes: [
    'pixId',
    'name',
    'nameEnUs',
    'index',
    'competence',
    'rawTubes',
  ],
  transform({
    id,
    airtableId,
    name_i18n,
    competenceAirtableId,
    tubeAirtableIds,
    ...thematic
  }) {
    return {
      ...thematic,
      id: airtableId,
      pixId: id,
      name: name_i18n.fr,
      nameEnUs: name_i18n.en,
      competence: competenceAirtableId && { id: competenceAirtableId },
      rawTubes: tubeAirtableIds?.map((id) => ({ id })),
    };
  },
  competence: {
    ref: 'id',
  },
  rawTubes: {
    ref: 'id',
  },
  typeForAttribute(attribute) {
    if (attribute === 'rawTubes') return 'tubes';
  },
});

export function serialize(thematics) {
  return serializer.serialize(thematics);
}
