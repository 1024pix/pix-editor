import { Mission } from '../../../lib/domain/models/Mission.js';

export function buildMissions(databaseBuilder) {
  databaseBuilder.factory.buildMission({
    name: 'Mission test active',
    cardImageUrl: 'https://example.net/image.png',
    competenceId: 'competenceF2A0C0',
    learningObjectives: 'Que tu sois le meilleur',
    thematicIds: 'thematicF2A0C0Th0,thematicF2A0C0Th1',
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
    competenceId: 'competenceF2A0C1',
    learningObjectives: 'Y\'en a plus',
    thematicIds: 'thematicF2A0C1Th0,thematicF2A0C1Th1',
    validatedObjectives: '- Ca aussi\n Et puis ça aussi',
    status: Mission.status.INACTIVE,
    createdAt: new Date('2023-12-18'),
  });
  databaseBuilder.factory.buildMission({
    name: 'Mission test expérimentale',
    cardImageUrl: 'https://example.net/image.png',
    competenceId: 'competenceF2A1C0',
    learningObjectives: 'Y\'en a plus',
    thematicIds: 'thematicF2A1C0Th0,thematicF2A1C0Th1,thematicF2A1C0Th2',
    validatedObjectives: '- Ca aussi\n Et puis ça aussi',
    status: Mission.status.EXPERIMENTAL,
    createdAt: new Date('2024-07-29'),
  });
}
