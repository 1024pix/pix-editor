import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('competence-overview', {
  attributes: [
    'thematicOverviews',
  ],
});

export function serialize(config) {
  return serializer.serialize(config);
}
