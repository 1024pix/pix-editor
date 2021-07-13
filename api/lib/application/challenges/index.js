const qs = require('qs');
const Boom = require('@hapi/boom');
const _ = require('lodash');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

function _parseQueryParams(search) {
  const paramsParsed = qs.parse(search, { ignoreQueryPrefix: true });
  const params = _.defaults(paramsParsed, { filter: {}, page: { size: 100 } });
  if (params.page.size) {
    params.page.size = parseInt(params.page.size);
  }
  return params;
}

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/challenges',
      config: {
        handler: async function(request) {
          const params = _parseQueryParams(request.url.search);
          const challenges = await challengeRepository.filter(params);
          return challengeSerializer.serialize(challenges);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/challenges/{id}',
      config: {
        handler: async function(request) {
          const params = { filter: { ids: [request.params.id] } };
          const challenges = await challengeRepository.filter(params);
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
    {
      method: 'PATCH',
      path: '/api/challenges/{id}',
      config: {
        handler: async function(request, h) {
          const challenge = await challengeSerializer.deserialize(request.payload);
          const updatedChallenge = await challengeRepository.update(challenge);
          return h.response(challengeSerializer.serialize(updatedChallenge));
        },
      },
    },
  ]);
};

exports.name = 'challenges';
