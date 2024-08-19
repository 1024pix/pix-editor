import { databaseBuffer } from '../database-buffer.js';
import { Mission } from '../../../../lib/domain/models/Mission.js';
import { buildTranslation } from './build-translation.js';

export function buildMission({
  id = databaseBuffer.nextId++,
  name = 'Ma première mission',
  competenceId = 'competenceId',
  learningObjectives = 'Que tu sois le meilleur',
  thematicIds = 'thematicIds',
  validatedObjectives = 'Rien',
  status = Mission.status.INACTIVE,
  introductionMediaUrl = null,
  introductionMediaAlt = null,
  introductionMediaType = null,
  documentationUrl = null,

  createdAt = new Date('2010-01-04'),
} = {}) {

  const values = { id, competenceId, thematicIds, createdAt, status, introductionMediaUrl, introductionMediaType, introductionMediaAlt, documentationUrl };

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
