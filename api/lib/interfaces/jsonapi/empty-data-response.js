import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer  } = JsonapiSerializer;

const serializer = new Serializer('', {});

export function emptyDataResponse() {
  return serializer.serialize(null);
}
