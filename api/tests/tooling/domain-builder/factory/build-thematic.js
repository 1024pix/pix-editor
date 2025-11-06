import { Thematic } from '../../../../lib/domain/models/index.js';

export function buildThematic({
  id = 'recFvllz2Ckz',
  name_i18n = {
    fr: 'Nom de la thématique',
    en: "Thematic's name",
  },
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
} = {}) {
  return new Thematic({
    id,
    name_i18n,
    airtableId: id,
    competenceId,
    competenceAirtableId: competenceId,
    tubeIds,
    tubeAirtableIds: tubeIds,
    index,
  });
}
