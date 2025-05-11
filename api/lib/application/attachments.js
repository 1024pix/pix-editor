import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import * as securityPreHandlers from './security-pre-handlers.js';
import * as usecases from '../domain/usecases/index.js';
import { logger } from '../infrastructure/logger.js';
import * as Types from './types.js';
import * as attachmentSerializer from '../infrastructure/serializers/jsonapi/attachment-serializer.js';
import * as attachmentRepository from '../infrastructure/repositories/attachment-repository.js';

export function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/attachments',
      config: {
        pre: [{
          method: (request, h) => {
            return securityPreHandlers.checkUserHasWriteAccess(request, h);
          }
        }],
        validate: {
          payload: Joi.object({
            data: {
              type: Joi.string().required().equal('attachments'),
              attributes: {
                'filename': Joi.string(),
                'size': Joi.number(),
                'url': Joi.string(),
                'mime-type': Joi.string(),
                'type': Joi.string(),
                'localized-challenge-id': Joi.string(),
              },
              relationships: {
                challenge: {
                  data: {
                    type: Joi.string().required().equal('challenges'),
                    id: Types.challengeId(),
                  },
                },
              },
            },
          }),
        },
        handler: async function(request, h) {
          try {
            const attachmentCreationCommand = attachmentSerializer.deserializeCreationCommand(request.payload);
            const createdAttachment = await usecases.createAttachment({ attachmentCreationCommand, attachmentRepository });
            return h.response(attachmentSerializer.serialize(createdAttachment)).code(201);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
    {
      method: 'DELETE',
      path: '/api/attachments/{attachmentId}',
      config: {
        pre: [{
          method: (request, h) => {
            return securityPreHandlers.checkUserHasWriteAccess(request, h);
          }
        }],
        validate: {
          params: Joi.object({
            attachmentId: Types.attachmentId().required(),
          }),
        },
        handler: async function(request, h) {
          try {
            const attachmentId = request.params.attachmentId;
            await usecases.deleteAttachment({ attachmentId, attachmentRepository });
            return h.response().code(204);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
    {
      method: 'GET',
      path: '/api/attachments',
      config: {
        validate: {
          query: Joi.object({
            'filter[localizedChallengeIds]': Joi.string().required(),
          }).required(),
        },
        handler: async function(request, h) {
          try {
            const query = attachmentSerializer.deserializeQuery(request.query);
            const attachments = await usecases.findAttachments({ query, attachmentRepository });
            return h.response(attachmentSerializer.serialize(attachments));
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
  ]);
}

export const name = 'attachments';
