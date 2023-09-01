import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

export function notFoundError(errorMessage) {
  return new JSONAPIError({
    status: '404',
    title: 'Not Found',
    detail: errorMessage
  });
}
