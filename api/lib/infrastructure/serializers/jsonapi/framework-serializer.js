import { Serializer, Deserializer } from 'jsonapi-serializer';
import { Framework } from '../../../domain/models/index.js';

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

const deserializer = new Deserializer({
  transform(frameworkDto) {
    return new Framework(frameworkDto);
  },
});

export function deserialize(payload) {
  return deserializer.deserialize(payload);
}
