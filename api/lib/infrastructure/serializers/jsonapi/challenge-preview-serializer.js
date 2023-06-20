const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(challengePreview) {
    return new Serializer('challenge-previews', {
      attributes: ['url'],
    }).serialize(challengePreview);
  },
};
