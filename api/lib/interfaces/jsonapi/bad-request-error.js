import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

export function badRequest(errorMessage) {
  return new JSONAPIError({
    status: '400',
    title: 'Bad Request',
    detail: errorMessage
  });
}
