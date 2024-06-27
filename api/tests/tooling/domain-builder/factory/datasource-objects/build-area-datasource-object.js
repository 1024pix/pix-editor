import { Area } from '../../../../../lib/domain/models/index.js';

export function buildAreaDatasourceObject({
  id = 'recvoGdo7z2z7pXWa',
  code = '1',
  competenceIds = [
    'recsvLz0W2ShyfD63',
    'recNv8qhaY887jQb2',
    'recIkYm646lrGvLNT',
  ],
  competenceAirtableIds = [
    'recChallenge0'
  ],
  color = Area.COLORS.CERULEAN,
  frameworkId = 'recFramework0',
} = {}) {

  return {
    id,
    code,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  };
}
