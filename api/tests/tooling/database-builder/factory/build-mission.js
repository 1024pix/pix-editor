import { databaseBuffer } from '../database-buffer.js';
import { Mission } from '../../../../lib/domain/models/Mission.js';
import { buildTranslation } from './build-translation.js';

export function buildMission({
  id = databaseBuffer.nextId++,
  name = 'Ma première mission',
  competenceId = 'competenceId',
  learningObjectives = 'Que tu sois le meilleur',
  thematicId = 'thematicId',
  validatedObjectives = 'Rien',
  status = Mission.status.INACTIVE,
  createdAt = new Date('2010-01-04'),
} = {}) {

  const values = { id, competenceId, thematicId, createdAt, status };

  buildTranslation({
    key: `mission.${id}.name`,
    locale: 'fr',
    value: name,
  });
  buildTranslation({
    key: `mission.${id}.learningObjectives`,
    locale: 'fr',
    value: learningObjectives,
  });
  buildTranslation({
    key: `mission.${id}.validatedObjectives`,
    locale: 'fr',
    value: validatedObjectives,
  });

  return databaseBuffer.pushInsertable({
    tableName: 'missions',
    values,
  });
}
