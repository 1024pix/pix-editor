const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(user) {
    return new Serializer('user', {
      attributes: ['name', 'trigram', 'createdAt', 'updatedAt', 'access'],
    }).serialize(user);
  }
};
