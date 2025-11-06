import { Area } from '../../../../../lib/domain/models/index.js';

export function buildAreaDatasourceObject({
  id = 'recvoGdo7z2z7pXWa',
  code = '1',
  competenceIds = [
    'recsvLz0W2ShyfD63',
    'recNv8qhaY887jQb2',
    'recIkYm646lrGvLNT',
  ],
  color = Area.COLORS.CERULEAN,
  frameworkId = 'recFramework0',
} = {}) {
  return {
    id,
    airtableId: id,
    code,
    competenceIds,
    competenceAirtableIds: competenceIds,
    color,
    frameworkId,
  };
}
