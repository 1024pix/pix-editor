import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import * as securityPreHandlers from './security-pre-handlers.js';
import { logger } from '../infrastructure/logger.js';
import { DomainError } from '../domain/errors.js';
import { tutorialRepository } from '../infrastructure/repositories/index.js';
import { Tutorial } from '../domain/models/index.js';
import * as Types from './types.js';
import { tutorialSerializer } from '../infrastructure/serializers/jsonapi/index.js';
import { createTutorial } from '../domain/usecases/index.js';

function checkUrl(value, helpers) {
  if (URL.canParse(value)) return value;
  return helpers.error('any.invalid');
}

export function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/tutorials',
      config: {
        pre: [{
          method: (request, h) => {
            return securityPreHandlers.checkUserHasWriteAccess(request, h);
          }
        }],
        validate: {
          payload: Joi.object({
            data: {
              type: Joi.string().required().equal('tutorials'),
              attributes: {
                'title': Joi.string().required(),
                'duration': Joi.string().pattern(
                  /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
                  'HH:MM:SS format'
                ).messages({
                  'string.pattern.name': 'Duration must be in HH:MM:SS format',
                }),
                'source': Joi.string().required(),
                'format': Joi.string().valid(...Object.values(Tutorial.FORMATS)).required(),
                'link': Joi.string().custom(checkUrl, 'URL Validation')
                  .messages({
                    'any.invalid': 'Must be a valid, absolute URL',
                  }).required(),
                'license': Joi.string().valid(...Object.values(Tutorial.LICENSES)).allow(null),
                'level': Joi.string().valid(...Object.values(Tutorial.LEVELS)).required(),
                'crush': Joi.string().valid(Tutorial.CRUSHES.YES).allow(null),
                'language': Joi.string().required(),
              },
              relationships: {
                tags: {
                  data: Joi.array().items(Joi.object({
                    type: Joi.string().required().equal('tags'),
                    id: Types.tagId(),
                  })).allow(null),
                },
              },
            },
          }),
        },
        handler: async function(request, h) {
          try {
            const tutorial = await tutorialSerializer.deserialize(request.payload);
            const createdTutorial = await createTutorial(tutorial, { tutorialRepository });
            return h.response(tutorialSerializer.serialize(createdTutorial)).code(201);
          } catch (err) {
            if (err instanceof DomainError) throw err;
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
    {
      method: 'GET',
      path: '/api/tutorials/{tutorialAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            tutorialAirtableId: Types.tutorialId().required(),
          }),
        },
        handler: async function(request) {
          try {
            const tutorial = await tutorialRepository.getByAirtableId(request.params.tutorialAirtableId);
            if (!tutorial) return Boom.notFound('unknown tutorial id');
            return tutorialSerializer.serialize(tutorial);
          } catch (err) {
            console.log(err);
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
  ]);
}

export const name = 'tutorials';
