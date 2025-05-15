import { Mission } from '../../../lib/domain/models/Mission.js';

export function buildMissions(databaseBuilder) {
  databaseBuilder.factory.buildMission({
    name: 'Mission test active',
    cardImageUrl: 'https://example.net/image.png',
    competenceId: 'competence1NC9NE3IIOa0ym',
    learningObjectives: 'Que tu sois le meilleur',
    thematicIds: 'recOO8OsMJpe5cZzi,recOO8OsMJpe5cZzi',
    validatedObjectives: '- Ca\n Et puis ça',
    status: Mission.status.VALIDATED,
    createdAt: new Date('2023-12-17'),
  });
  // 3 missions
  // 1 mission experimental
  // 1 compétence
  // 3 thématiques
  // th1 : 1 tube _en 1 _di 1 _va
  // t _en:   2 acquis actif (les niveaux c'est pas important) / 1 épreuve proto validé
  // t _di:   2 acquis actif (les niveaux c'est pas important) / 1 épreuve proto validé

  databaseBuilder.factory.buildMission({
    name: 'Mission test inactive',
    cardImageUrl: 'https://example.net/image.png',
    competenceId: 'competence2k2eVZ2GRLwqFL',
    learningObjectives: 'Y\'en a plus',
    thematicIds: 'rec98EBX88mkQR3gx,rec98EBX88mkQR3gx',
    validatedObjectives: '- Ca aussi\n Et puis ça aussi',
    status: Mission.status.INACTIVE,
    createdAt: new Date('2023-12-18'),
  });
  databaseBuilder.factory.buildMission({
    name: 'Mission test inactive',
    cardImageUrl: 'https://example.net/image.png',
    competenceId: 'competence1NC9NE3IIOa0ym',
    learningObjectives: 'Y\'en a plus',
    thematicIds: 'recOO8OsMJpe5cZzi,recj6ITlVfU0vByrR,recRSPkFIgrY6Ps61',
    validatedObjectives: '- Ca aussi\n Et puis ça aussi',
    status: Mission.status.INACTIVE,
    createdAt: new Date('2023-12-18'),
  });
  databaseBuilder.factory.buildMission({
    name: 'Mission test expérimentale',
    cardImageUrl: 'https://example.net/image.png',
    competenceId: 'competence1NC9NE3IIOa0ym',
    learningObjectives: 'Y\'en a plus',
    thematicIds: 'recOO8OsMJpe5cZzi,recj6ITlVfU0vByrR,recRSPkFIgrY6Ps61',
    validatedObjectives: '- Ca aussi\n Et puis ça aussi',
    status: Mission.status.EXPERIMENTAL,
    createdAt: new Date('2024-07-29'),
  });
}
