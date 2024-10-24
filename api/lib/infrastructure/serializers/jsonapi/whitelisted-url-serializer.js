import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('whitelisted-urls', {
  attributes: [
    'createdAt',
    'updatedAt',
    'creatorName',
    'latestUpdatorName',
    'url',
    'relatedEntityIds',
    'comment',
    'checkType',
  ],
});

export function serialize(whitelistedUrl) {
  return serializer.serialize(whitelistedUrl);
}
