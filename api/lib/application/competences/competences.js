import Joi from 'joi';
import * as securityPreHandlers from '../security-pre-handlers.js';
import * as usecases from '../../domain/usecases/index.js';
import { competenceSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { competenceRepository } from '../../infrastructure/repositories/index.js';
import * as Types from '../types.js';
import { NotFoundError } from '../../infrastructure/errors.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/competences',
      config: {
        handler: async function() {
          const competences = await competenceRepository.list();
          return competenceSerializer.serialize(competences);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/competences/{competenceAirtableId}',
      config: {
        validate: { params: Joi.object({ competenceAirtableId: Types.competenceId().required() }) },
        handler: async function(request) {
          const competence = await competenceRepository.getByAirtableId(request.params.competenceAirtableId);
          if (!competence) throw new NotFoundError('unknown competence');
          return competenceSerializer.serialize(competence);
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
                title: Joi.string().allow(null),
                'title-en': Joi.string().allow(null),
                description: Joi.string().allow(null),
                'description-en': Joi.string().allow(null),
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
          const competence = await competenceSerializer.deserialize(request.payload);
          const createdCompetence = await usecases.createCompetence(competence);
          return h.response(competenceSerializer.serialize(createdCompetence)).code(201);
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/competences/{competenceAirtableId}',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasAdminAccess }],
        validate: {
          params: Joi.object({ competenceAirtableId: Types.competenceId().required() }),
          payload: Joi.object({
            data: {
              type: Joi.string().required().equal('competences'),
              id: Types.competenceId().required(),
              attributes: Joi.object({
                title: Joi.string().allow(null),
                'title-en': Joi.string().allow(null),
                description: Joi.string().allow(null),
                'description-en': Joi.string().allow(null),
              }).unknown(true),
              relationships: Joi.object(),
            },
          }),
        },
        handler: async function(request) {
          const competenceUpdates = await competenceSerializer.deserialize(request.payload);

          const updatedCompetence = await usecases.updateCompetence(
            request.params.competenceAirtableId,
            competenceUpdates,
          );

          return competenceSerializer.serialize(updatedCompetence);
        },
      },
    },
  ]);
}

export const name = 'competences';
