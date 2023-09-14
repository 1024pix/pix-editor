import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

export function internalError(errorMessage) {
  return new JSONAPIError({
    status: '500',
    title: 'Internal Server Error',
    detail: errorMessage
  });
}
