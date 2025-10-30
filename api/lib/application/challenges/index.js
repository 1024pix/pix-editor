import Joi from 'joi';
import { logger } from '../../infrastructure/logger.js';
import { attachmentRepository, challengeRepository } from '../../infrastructure/repositories/index.js';
import { challengeSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import * as securityPreHandlers from '../security-pre-handlers.js';
import { createChallengeTransformer } from '../../infrastructure/transformers/index.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import {
  createChallenge,
  getPhraseTranslationsURL,
  previewChallenge,
  updateChallenge,
} from '../../domain/usecases/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';

const challengeIdType = Joi.string()
  .pattern(/^(rec|challenge)[a-zA-Z0-9]+$/)
  .required();

async function _refreshCache({ challenge }) {
  try {
    const attachments = await attachmentRepository.listByLocalizedChallengeId(challenge.id);
    const transformChallenge = createChallengeTransformer({ attachments });
    const newChallenge = transformChallenge(challenge);

    const model = 'challenges';

    await updatedRecordNotifier.notify({
      updatedRecord: newChallenge,
      model,
      pixApiClient,
    });
  } catch (err) {
    logger.error(err);
  }
}

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/challenges',
      config: {
        handler: async function (request) {
          const params = extractParameters(request.query, {
            page: { size: 100 },
          });
          let challenges;
          if (params.filter?.ids) {
            challenges = await challengeRepository.getMany(params.filter.ids);
          } else {
            challenges = await challengeRepository.filter(params);
          }
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
        handler: async function (request) {
          const challengeId = request.params.id;
          const challenge = await challengeRepository.get(challengeId);
          return challengeSerializer.serialize(challenge);
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
            locale: Joi.string().min(2),
          }),
        },
        handler: async function (request, h) {
          const challengeId = request.params.id;
          const locale = request.query.locale;

          const previewUrl = await previewChallenge({ challengeId, locale }, { refreshCache: _refreshCache });
          return h.redirect(previewUrl);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/challenges/{id}/translations/{locale}/framework-name/{frameworkName}/area-code/{areaCode}',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: challengeIdType,
            locale: Joi.string().min(2),
            areaCode: Joi.number(),
            frameworkName: Joi.string(),
          }),
        },
        handler: async function (request, h) {
          const challengeId = request.params.id;
          const locale = request.params.locale;
          const areaCode = request.params.areaCode;
          const frameworkName = request.params.frameworkName;

          const translationsUrl = await getPhraseTranslationsURL({
            challengeId,
            locale,
            areaCode,
            frameworkName,
          });

          return h.redirect(translationsUrl);
        },
      },
    },
    {
      method: 'POST',
      path: '/api/challenges',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: async function (request, h) {
          const challenge = await challengeSerializer.deserialize(request.payload);
          const createdChallenge = await createChallenge(challenge, {
            challengeRepository,
          });
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
        handler: async function (request, h) {
          const challenge = await challengeSerializer.deserialize(request.payload);
          const updatedChallenge = await updateChallenge(challenge);
          return h.response(challengeSerializer.serialize(updatedChallenge));
        },
      },
    },
  ]);
}

export const name = 'challenges';
