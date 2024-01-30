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
    },{
      method: 'GET',
      path: '/api/missions/{id}',
      config: {
        handler: missionController.getMission,
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
    {
      method: 'PATCH',
      path: '/api/missions/{id}',
      config: {
        pre: [{ method: securityPreHandlers.checkUserHasWriteAccess }],
        handler: missionController.update,
      },
    },
  ]);
}

export const name = 'missions-api';
