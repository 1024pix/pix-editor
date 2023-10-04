import qs from 'qs';
import Boom from '@hapi/boom';
import _ from 'lodash';
import Joi from 'joi';
import Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import { challengeRepository } from '../../infrastructure/repositories/index.js';
import { challengeSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import * as securityPreHandlers from '../security-pre-handlers.js';
import { attachmentDatasource } from '../../infrastructure/datasources/airtable/index.js';
import { challengeTransformer } from '../../infrastructure/transformers/index.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as usecases from '../../domain/usecases/index.js';

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
  if (!pixApiClient.isPixApiCachePatchingEnabled()) return;

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

export async function register(server) {
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
          const createdChallenge = await usecases.createChallenge(challenge);
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
          const updatedChallenge = await usecases.updateChallenge(challenge);
          await _refreshCache(updatedChallenge);
          return h.response(challengeSerializer.serialize(updatedChallenge));
        },
      },
    },
  ]);
}

export const name = 'challenges';
