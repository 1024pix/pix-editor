import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

export function unauthorized(errorMessage) {
  return new JSONAPIError({
    status: '401',
    title: 'Unauthorized',
    detail: errorMessage
  });
}
