import { Mission } from '../../../lib/domain/models/Mission.js';

export function buildMissions(databaseBuilder) {
  databaseBuilder.factory.buildMission({
    name: 'Mission test active',
    competenceId: 'competence1NC9NE3IIOa0ym',
    learningObjectives: 'Que tu sois le meilleur',
    thematicIds: 'recOO8OsMJpe5cZzi,recOO8OsMJpe5cZzi',
    validatedObjectives: '- Ca\n Et puis ça',
    status: Mission.status.VALIDATED,
    createdAt: new Date('2023-12-17'),
  });

  databaseBuilder.factory.buildMission({
    name: 'Mission test inactive',
    competenceId: 'competence2k2eVZ2GRLwqFL',
    learningObjectives: 'Y\'en a plus',
    thematicIds: 'rec98EBX88mkQR3gx,rec98EBX88mkQR3gx',
    validatedObjectives: '- Ca aussi\n Et puis ça aussi',
    status: Mission.status.INACTIVE,
    createdAt: new Date('2023-12-18'),
  });
  databaseBuilder.factory.buildMission({
    name: 'Mission test inactive',
    competenceId: 'competence1NC9NE3IIOa0ym',
    learningObjectives: 'Y\'en a plus',
    thematicIds: 'recOO8OsMJpe5cZzi,recj6ITlVfU0vByrR,recRSPkFIgrY6Ps61',
    validatedObjectives: '- Ca aussi\n Et puis ça aussi',
    status: Mission.status.INACTIVE,
    createdAt: new Date('2023-12-18'),
  });
  databaseBuilder.factory.buildMission({
    name: 'Mission test expérimentale',
    competenceId: 'competence1NC9NE3IIOa0ym',
    learningObjectives: 'Y\'en a plus',
    thematicIds: 'recOO8OsMJpe5cZzi,recj6ITlVfU0vByrR,recRSPkFIgrY6Ps61',
    validatedObjectives: '- Ca aussi\n Et puis ça aussi',
    status: Mission.status.EXPERIMENTAL,
    createdAt: new Date('2024-07-29'),
  });
}
