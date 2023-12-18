import * as missionController from './mission-controller.js';
export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/missions',
      config: {
        handler: missionController.findMissions,
      },
    },
  ]);
}

export const name = 'missions-api';
