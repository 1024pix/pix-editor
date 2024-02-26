import { CompetenceForRelease } from '../../../../lib/domain/models/release/index.js';

export function buildCompetenceForRelease({
  id = 'recCompetence1',
  name = 'nameCompetence1',
  name_i18n = { fr: 'nameFrCompetence1', en: 'nameUsCompetence1' },
  index = '1.1',
  description = 'descriptionCompetence1',
  description_i18n = { fr: 'descriptionFrCompetence1', en:'descriptionUsCompetence1' },
  areaId = 'recArea1',
  skillIds = ['recSkill1', 'recSkill2'],
  thematicIds = ['recThematic1'],
  origin = 'Pix',
} = {}) {
  return new CompetenceForRelease({
    id,
    name,
    name_i18n,
    index,
    description,
    description_i18n,
    areaId,
    skillIds,
    thematicIds,
    origin,
  });
}
