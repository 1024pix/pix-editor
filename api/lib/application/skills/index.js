import * as securityPreHandlers from '../security-pre-handlers.js';
import * as skillsController from './skills.js';
import Joi from 'joi';

const tubeIdType = Joi.string().pattern(/^(rec|tube)[a-zA-Z0-9]+$/).required();
const skillIdType = Joi.string().pattern(/^(rec|skill)[a-zA-Z0-9]+$/).required();

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
                tubeDestinationId: tubeIdType,
                skillIdToClone: skillIdType,
                level: Joi.number().required(),
              },
            },
          }),
        },
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: skillsController.clone,
      },
    },
  ]);
}

export const name = 'skills-api';
