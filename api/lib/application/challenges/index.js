const qs = require('qs');
const Boom = require('@hapi/boom');
const _ = require('lodash');
const Joi = require('joi');
const Sentry = require('@sentry/node');
const logger = require('../../infrastructure/logger');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');
const challengePreviewSerializer = require('../../infrastructure/serializers/jsonapi/challenge-preview-serializer');
const securityPreHandlers = require('../security-pre-handlers');
const attachmentDatasource = require('../../infrastructure/datasources/airtable/attachment-datasource');
const challengeTransformer = require('../../infrastructure/transformers/challenge-transformer');
const pixApiClient = require('../../infrastructure/pix-api-client');
const updatedRecordNotifier = require('../../infrastructure/event-notifier/updated-record-notifier');
const config = require('../../config');

function _parseQueryParams(search) {
  const paramsParsed = qs.parse(search, { ignoreQueryPrefix: true });
  const params = _.defaults(paramsParsed, { filter: {}, page: { size: 100 } });
  if (params.page.size) {
    params.page.size = parseInt(params.page.size);
  }
  return params;
}

const challengeIdType = Joi.string().pattern(/^(rec|challenge)[a-zA-Z0-9]+$/).required();

async function _refreshCache(challenge) {
  if (config.pixEditor.newPreview) return;

  try {
    const attachments = await attachmentDatasource.filterByChallengeId(challenge.id);
    const learningContent = {
      attachments,
    };
    const transformChallenge = challengeTransformer.createChallengeTransformer(learningContent);
    const newChallenge = transformChallenge(challenge);

    const model = 'challenges';

    await updatedRecordNotifier.notify({ updatedRecord: newChallenge, model, pixApiClient });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
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
        validate: {
          params: Joi.object({
            id: challengeIdType,
          }),
        },
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
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const challenge = await challengeSerializer.deserialize(request.payload);
          const createdChallenge = await challengeRepository.create(challenge);
          await _refreshCache(createdChallenge);
          return h.response(challengeSerializer.serialize(createdChallenge)).created();
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/challenges/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: challengeIdType,
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          const challenge = await challengeSerializer.deserialize(request.payload);
          const updatedChallenge = await challengeRepository.update(challenge);
          await _refreshCache(updatedChallenge);
          return h.response(challengeSerializer.serialize(updatedChallenge));
        },
      },
    },
    {
      method: 'POST',
      path: '/api/challenges/{id}/previews',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function(request, h) {
          if (!config.pixEditor.newPreview) {
            return Boom.notFound();
          }

          const params = { filter: { ids: [request.params.id] } };
          const [challenge] = await challengeRepository.filter(params);
          if (challenge == null) {
            return Boom.notFound();
          }

          const attachments = await attachmentDatasource.filterByChallengeId(challenge.id);
          const learningContent = {
            attachments,
          };
          const transformChallenge = challengeTransformer.createChallengeTransformer(learningContent);
          const newChallenge = transformChallenge(challenge);

          const { data: { id } } = await pixApiClient.post({ url: '/api/challenge-previews', payload: newChallenge });
          const url = `http://localhost:4200/challenge-previews/${id}`; // FIXME use config for base url (PIX_STAGING?!)

          return h.response(challengePreviewSerializer.serialize({ id, url }));
        },
      },
    },
  ]);
};

exports.name = 'challenges';
