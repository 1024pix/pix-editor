import { Mission } from '../../../../lib/domain/models/index.js';

export function buildMission({
  id = 3,
  name = 'Ma mission',
  competenceId = 'recCompetence1',
  thematicId = 'recThematic1',
  createdAt = new Date('2023-10-14'),
  learningObjectives = '- Que tu deviennes forte\n Et...',
  validatedObjectives = '- Ca\n Et puis ça',
  status = Mission.status.ACTIVE,
} = {}) {
  return new Mission ({
    id,
    name_i18n: { fr: name },
    competenceId,
    thematicId,
    createdAt,
    learningObjectives_i18n: { fr: learningObjectives },
    validatedObjectives_i18n: { fr: validatedObjectives },
    status,
  });
}
