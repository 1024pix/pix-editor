import Joi from 'joi';

import * as securityPreHandlers from '../security-pre-handlers.js';
import * as skillsController from './skills.js';
import * as Types from '../types.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/skills',
      handler: skillsController.list,
    },
    {
      method: 'POST',
      path: '/api/skills/clone',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                tubeDestinationId: Types.tubeId().required(),
                skillIdToClone: Types.skillId().required(),
                level: Joi.number().required(),
              },
            },
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: skillsController.clone,
      },
    },
    {
      method: 'GET',
      path: '/api/skills/{skillId}/challenges-production',
      config: {
        validate: {
          params: Joi.object({
            skillId: Types.skillId().required(),
          }),
        },
        handler: skillsController.getProductionChallenges,
      },
    },
    {
      method: 'GET',
      path: '/api/skills/{skillId}/localized-challenges-production',
      config: {
        validate: {
          params: Joi.object({
            skillId: Types.skillId().required(),
          }),
        },
        handler: skillsController.getProductionLocalizedChallenges,
      },
    },
    {
      method: 'GET',
      path: '/api/skills/{skillAirtableId}',
      config: {
        validate: {
          params: Joi.object({
            skillAirtableId: Types.skillId().required(),
          }),
        },
        handler: skillsController.get,
      },
    },
    {
      method: 'POST',
      path: '/api/skills',
      config: {
        validate: {
          payload: Joi.object({
            data: {
              type: Joi.string().required().equal('skills'),
              attributes: {
                'level': Joi.number().required(),
                'description': Joi.string().allow(null),
                'description-status': Joi.string().allow(null),
                'clue': Joi.string().allow(null),
                'clue-en': Joi.string().allow(null),
                'clue-status': Joi.string().allow(null),
                'i18n': Joi.string().allow(null),
                'name': Joi.string().allow(null),
                'status': Joi.string().allow(null),
                'version': Joi.number().allow(null),
              },
              relationships: {
                'tube': {
                  data: {
                    type: Joi.string().required().equal('tubes'),
                    id: Types.tubeId(),
                  },
                },
                'tuto-more': Types.tutorialsRelationship(),
                'tuto-solution': Types.tutorialsRelationship(),
              },
            },
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: skillsController.create,
      },
    },
  ]);
}

export const name = 'skills-api';
