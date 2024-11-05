import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('competence-overview', {
  attributes: [
    'thematicOverviews',
    'tubesCount',
    'skillsCount',
  ],
});

export function serialize(config) {
  return serializer.serialize(config);
}
