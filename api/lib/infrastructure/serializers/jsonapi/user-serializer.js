import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('user', {
  attributes: ['name', 'trigram', 'createdAt', 'updatedAt', 'access'],
});

export function serialize(user) {
  return serializer.serialize(user);
}
