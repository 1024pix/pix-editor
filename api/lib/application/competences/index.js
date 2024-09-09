import * as competences from './competences.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/competences/:id',
      config: {
        handler: competences.getCompetenceOverview,
      },
    },
  ]);
}

export const name = 'competences-api';
