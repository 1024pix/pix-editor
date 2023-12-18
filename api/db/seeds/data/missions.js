import { Mission } from '../../../lib/domain/models/Mission.js';

export function buildMissions(databaseBuilder) {
  databaseBuilder.factory.buildMission({
    id : 1,
    name : 'Mission test active',
    competenceId : 'competence2LLOcPlzpjR0UD',
    learningObjectives : 'Que tu sois le meilleur',
    thematicId : 'recExjO7RHeDI48HK',
    validatedObjectives : '- Ca\n Et puis ça',
    status : Mission.status.ACTIVE,
    createdAt : new Date('2023-12-17'),
  });

  databaseBuilder.factory.buildMission({
    id : 2,
    name : 'Mission test inactive',
    competenceId : 'competence19Y5Op9XTwCRhc',
    learningObjectives : 'Y\'en a plus',
    thematicId : 'recZtwymXXrtdXRrx',
    validatedObjectives : '- Ca aussi\n Et puis ça aussi',
    status : Mission.status.INACTIVE,
    createdAt : new Date('2023-12-18'),
  });
}
