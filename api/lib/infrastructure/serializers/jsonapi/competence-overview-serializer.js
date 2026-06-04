import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('competence-overview', {
  attributes: [
    'airtableId',
    'name',
    'thematicOverviews',
    'tubesCount',
    'skillsCount',
    'primaryLocales',
  ],
});

export function serialize(competenceOverview) {
  return serializer.serialize(competenceOverview);
}
