import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('framework', {
  attributes: [
    'name',
    'areas',
  ],
  transform({ areaIds, ...framework }) {
    return {
      ...framework,
      areas: areaIds?.map((id) => ({ id }))
    };
  },
  areas: {
    ref: 'id',
  },
});

export function serialize(frameworks) {
  return serializer.serialize(frameworks);
}
