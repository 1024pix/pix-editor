import { Competence } from '../../../../lib/domain/models/index.js';

export function buildCompetence({
  id = 'recCompetence1',
  airtableId = 'recAirtableCompetence1',
  name = 'nameCompetence1',
  name_i18n = { fr: 'nameFrCompetence1', en: 'nameUsCompetence1' },
  index = '1.1',
  description = 'descriptionCompetence1',
  description_i18n = { fr: 'descriptionFrCompetence1', en:'descriptionUsCompetence1' },
  areaId = 'recArea1',
  areaAirtableId = 'recr32j23d3djp1d',
  skillIds = ['recSkill1', 'recSkill2'],
  thematicIds = ['recThematic1'],
  thematicAirtableIds = ['recpq782rf2h3df'],
  tubeAirtableIds = ['recP12434hvf34', 'recO01dh3298cf'],
  origin = 'Pix',
} = {}) {
  return new Competence({
    id,
    airtableId,
    name,
    name_i18n,
    index,
    description,
    description_i18n,
    areaId,
    areaAirtableId,
    skillIds,
    thematicIds,
    thematicAirtableIds,
    tubeAirtableIds,
    origin,
  });
}
