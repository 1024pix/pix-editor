const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/challenges',
      config: {
        handler: async function(request) {
          const challenges = await challengeRepository.filter();
          return challengeSerializer.serialize(challenges);
        },
      },
    },
  ]);
};

exports.name = 'challenges';

