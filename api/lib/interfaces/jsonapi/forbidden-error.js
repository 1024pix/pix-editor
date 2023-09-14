import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

export function forbiddenError(errorMessage) {
  return new JSONAPIError({
    status: '403',
    title: 'Forbidden Error',
    detail: errorMessage
  });
}
