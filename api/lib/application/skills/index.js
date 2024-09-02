import * as securityPreHandlers from '../security-pre-handlers.js';
import * as skillsController from './skills.js';

export async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/skills/clone',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: skillsController.clone,
      },
    },
  ]);
}

export const name = 'skills-api';
