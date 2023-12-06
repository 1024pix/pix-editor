import qs from 'qs';
import Boom from '@hapi/boom';
import _ from 'lodash';
import Joi from 'joi';
import Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import { challengeRepository, localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { challengeSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import * as securityPreHandlers from '../security-pre-handlers.js';
import { attachmentDatasource } from '../../infrastructure/datasources/airtable/index.js';
import { createChallengeTransformer } from '../../infrastructure/transformers/index.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import { previewChallenge } from '../../domain/usecases/index.js';

function _parseQueryParams(search) {
  const paramsParsed = qs.parse(search, { ignoreQueryPrefix: true });
  const params = _.defaults(paramsParsed, { filter: {}, page: { size: 100 } });
  if (params.page.size) {
    params.page.size = parseInt(params.page.size);
  }
  return params;
}

const challengeIdType = Joi.string().pattern(/^(rec|challenge)[a-zA-Z0-9]+$/).required();

async function _refreshCache({ challenge, localizedChallenge }) {
  if (!pixApiClient.isPixApiCachePatchingEnabled()) return;

  try {
    const attachments = await attachmentDatasource.filterByChallengeId(challenge.id);
    const transformChallenge = createChallengeTransformer({
      attachments,
      localizedChallenge,
    });
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
          const localizedChallenges = await localizedChallengeRepository.listByChallengeIds(challenges.map(({ id })=> id));
          const localizedChallengesByChallengeId = _.groupBy(localizedChallenges, 'challengeId');
          return challengeSerializer.serialize(
            challenges.map((challenge) => challengeWithAlternativeLocales(challenge, localizedChallengesByChallengeId[challenge.id])),
          );
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
          const challengeId = request.params.id;
          const params = { filter: { ids: [challengeId] } };
          const challenges = await challengeRepository.filter(params);
          if (challenges.length === 0) {
            return Boom.notFound();
          }
          const localizedChallenges = await localizedChallengeRepository.listByChallengeIds([challengeId]);
          return challengeSerializer.serialize(challengeWithAlternativeLocales(challenges[0], localizedChallenges));
        },
      },
    },
    {
      method: 'GET',
      path: '/api/challenges/{id}/preview',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: challengeIdType,
          }),
          query: Joi.object({
            locale: Joi.string().min(2).max(5)
          }),
        },
        handler: async function(request, h) {
          const challengeId = request.params.id;
          const locale = request.query.locale;

          const previewUrl = await previewChallenge({ challengeId, locale }, { refreshCache: _refreshCache });
          return h.redirect(previewUrl);
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
          await _refreshCache({ challenge: createdChallenge });
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
          await _refreshCache({ challenge: updatedChallenge });
          return h.response(challengeSerializer.serialize(updatedChallenge));
        },
      },
    },
  ]);
}

export const name = 'challenges';

function challengeWithAlternativeLocales(challenge, localizedChallenges) {
  const alternativeLocales = localizedChallenges
    ?.filter(({ locale }) => locale !== challenge.primaryLocale)
    ?.map(({ locale }) => locale) ?? [];
  return { ...challenge, alternativeLocales };
}
