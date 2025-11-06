import { Competence } from '../../../../lib/domain/models/index.js';

export function buildCompetence({
  id = 'recCompetence1',
  name_i18n = { fr: 'nameFrCompetence1', en: 'nameUsCompetence1' },
  index = '1.1',
  description_i18n = { fr: 'descriptionFrCompetence1', en: 'descriptionUsCompetence1' },
  areaId = 'recArea1',
  skillIds = ['recSkill1', 'recSkill2'],
  thematicIds = ['recThematic1'],
  tubeIds = ['tubeP12434hvf34', 'tubeO01dh3298cf'],
  origin = 'Pix',
} = {}) {
  return new Competence({
    id,
    airtableId: id,
    name_i18n,
    index,
    description_i18n,
    areaId,
    areaAirtableId: areaId,
    skillIds,
    thematicIds,
    thematicAirtableIds: thematicIds,
    tubeAirtableIds: tubeIds,
    tubeIds,
    origin,
  });
}
