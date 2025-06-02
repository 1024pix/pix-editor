import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import * as securityPreHandlers from './security-pre-handlers.js';
import * as usecases from '../domain/usecases/index.js';
import { logger } from '../infrastructure/logger.js';
import { tagRepository } from '../infrastructure/repositories/index.js';
import { skillId, tutorialId } from './types.js';
import { deserialize, serialize } from '../infrastructure/serializers/jsonapi/tag-serializer.js';

export function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/tags',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('tags').required(),
              attributes: Joi.object({
                title: Joi.string().required(),
                description: Joi.string().allow('', null).optional(),
                notes: Joi.string().allow('', null).optional(),
              }).required(),
              relationships: Joi.object({
                skills: Joi.object({
                  data: Joi.object({
                    type: Joi.string().valid('skills').required(),
                    id: skillId().required(),
                  }).required(),
                }).optional(),
                tutorials: Joi.object({
                  data: Joi.array().items(
                    Joi.object({
                      type: Joi.string().valid('tutorials').required(),
                      id: tutorialId().required(),
                    })
                  ).optional().min(0),
                }).optional(),
              }).optional(),
            }).required(),
          }),
        },
        handler: async function(request, h) {
          try {
            const tagModelFromPayload = await deserialize(request.payload);
            const createdTag = await usecases.createTag(tagModelFromPayload, { tagRepository });
            return h.response(serialize(createdTag)).code(201);
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

export const name = 'tags';
