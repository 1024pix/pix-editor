import { Mission } from '../../../lib/domain/models/Mission.js';

export function buildMissions(databaseBuilder) {
  databaseBuilder.factory.buildMission({
    name : 'Mission test active',
    competenceId : 'competence1NC9NE3IIOa0ym',
    learningObjectives : 'Que tu sois le meilleur',
    thematicId : 'recOO8OsMJpe5cZzi',
    validatedObjectives : '- Ca\n Et puis ça',
    status : Mission.status.ACTIVE,
    createdAt : new Date('2023-12-17'),
  });

  databaseBuilder.factory.buildMission({
    name : 'Mission test inactive',
    competenceId : 'competence2k2eVZ2GRLwqFL',
    learningObjectives : 'Y\'en a plus',
    thematicId : 'rec98EBX88mkQR3gx',
    validatedObjectives : '- Ca aussi\n Et puis ça aussi',
    status : Mission.status.INACTIVE,
    createdAt : new Date('2023-12-18'),
  });
}
