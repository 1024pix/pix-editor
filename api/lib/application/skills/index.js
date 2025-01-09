import * as securityPreHandlers from '../security-pre-handlers.js';
import * as skillsController from './skills.js';
import Joi from 'joi';
import { Types } from '../types.js';

export async function register(server) {
  server.route([
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
  ]);
}

export const name = 'skills-api';
