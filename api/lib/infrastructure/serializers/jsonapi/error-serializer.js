import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

export function serialize(infrastructureError) {
  return JSONAPIError({
    status: `${infrastructureError.status}`,
    title: infrastructureError.title,
    detail: infrastructureError.message
  });
}
