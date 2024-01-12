import * as missionController from './mission-controller.js';
import * as securityPreHandlers from '../security-pre-handlers.js';
export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/missions',
      config: {
        handler: missionController.findMissions,
      },
    },
    {
      method: 'POST',
      path: '/api/missions',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: missionController.create,
      },
    },
  ]);
}

export const name = 'missions-api';
