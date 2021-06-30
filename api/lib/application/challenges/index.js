const qs = require('qs');
const Boom = require('@hapi/boom');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/challenges',
      config: {
        handler: async function(request) {
          const params = qs.parse(request.url.search, { ignoreQueryPrefix: true });
          const filter = params.filter || {};
          const challenges = await challengeRepository.filter(filter);
          return challengeSerializer.serialize(challenges);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/challenges/{id}',
      config: {
        handler: async function(request) {
          const filter = { ids: [request.params.id] };
          const challenges = await challengeRepository.filter(filter);
          if (challenges.length === 0) {
            return Boom.notFound();
          }
          return challengeSerializer.serialize(challenges[0]);
        },
      },
    },
    {
      method: 'POST',
      path: '/api/challenges',
      config: {
        handler: async function(request, h) {
          const challenge = await challengeSerializer.deserialize(request.payload);
          const createdChallenge = await challengeRepository.create(challenge);
          return h.response(challengeSerializer.serialize(createdChallenge)).created();
        },
      },
    },
  ]);
};

exports.name = 'challenges';
