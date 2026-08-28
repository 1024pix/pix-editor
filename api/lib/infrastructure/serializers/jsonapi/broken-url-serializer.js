import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('broken-urls', {
  attributes: [
    'url',
    'statusCode',
    'errorMessage',
    'challenges',
    'tutorials',
  ],
});

export function serialize(brokenUrl) {
  return serializer.serialize(brokenUrl);
}
