import { ThematicForRelease } from '../../../../lib/domain/models/release/ThematicForRelease.js';

export function buildThematicForRelease({
  id = 'recFvllz2Ckz',
  name_i18n = {
    fr: 'Nom de la thématique',
    en: 'Thematic\'s name',
  },
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
} = {}) {
  return new ThematicForRelease({
    id,
    name_i18n,
    competenceId,
    tubeIds,
    index,
  });
}
