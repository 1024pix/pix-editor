import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import * as securityPreHandlers from '../security-pre-handlers.js';
import * as usecases from '../../domain/usecases/index.js';
import { logger } from '../../infrastructure/logger.js';
import { competenceSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { competenceRepository } from '../../infrastructure/repositories/index.js';
import { Types } from '../types.js';
import { NotFoundError } from '../../infrastructure/errors.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/competences',
      config: {
        handler: async function() {
          try {
            const competences = await competenceRepository.list();
            return competenceSerializer.serialize(competences);
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
      path: '/api/competences/{competenceAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            competenceAirtableId: Types.competenceId().required(),
          }),
        },
        handler: async function(request) {
          try {
            const competence = await competenceRepository.getByAirtableId(request.params.competenceAirtableId);
            if (!competence) throw new NotFoundError('unknown competence');
            return competenceSerializer.serialize(competence);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
            return Boom.internal(err);
          }
        },
      },
    },
    {
      method: 'POST',
      path: '/api/competences',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        validate: {
          payload: Joi.object({
            data: {
              type: Joi.string().required().equal('competences'),
              attributes: {
                title: Joi.string(),
                'title-en': Joi.string(),
                description: Joi.string(),
                'description-en': Joi.string(),
              },
              relationships: {
                area: {
                  data: {
                    type: Joi.string().required().equal('areas'),
                    id: Types.areaId(),
                  },
                },
              },
            },
          }),
        },
        handler: async function(request, h) {
          try {
            const competence = await competenceSerializer.deserialize(request.payload);
            const createdCompetence = await usecases.createCompetence(competence);
            return h.response(competenceSerializer.serialize(createdCompetence)).code(201);
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

export const name = 'competences';
