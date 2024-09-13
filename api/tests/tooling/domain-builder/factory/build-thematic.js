import { Thematic } from '../../../../lib/domain/models/index.js';

export function buildThematic({
  id = 'recFvllz2Ckz',
  airtableId = 'recAirtableThematic',
  name_i18n = {
    fr: 'Nom de la thématique',
    en: 'Thematic\'s name',
  },
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
} = {}) {
  return new Thematic({
    id,
    name_i18n,
    airtableId,
    competenceId,
    tubeIds,
    index,
  });
}
