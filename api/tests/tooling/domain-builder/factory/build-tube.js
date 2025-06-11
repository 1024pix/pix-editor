import { Tube } from '../../../../lib/domain/models/Tube.js';

export function buildTube({
  id = 'tubeTIddrkopID23Fp',
  airtableId = 'recAirtableTube1',
  name = '@Moteur',
  practicalTitle_i18n = {
    fr: 'Outils d\'accès au web',
    en: 'Tools for web',
  },
  practicalDescription_i18n = {
    fr: 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
    en: 'Identify a web browser and a search engine, know how the search engine works',
  },
  thematicAirtableId = 'recAirFlqfqwl1231bd1',
  competenceAirtableId = 'recAirsvLz0W2ShyfD63',
  competenceId = 'recsvLz0W2ShyfD63',
  skillAirtableIds = ['recSkill1231114871', 'recSkill41094182112'],
  skillIds = ['skill1231114871', 'skill41094182112'],
  index = 1,
} = {}) {
  return new Tube({
    id,
    airtableId,
    name,
    practicalTitle_i18n,
    practicalDescription_i18n,
    thematicAirtableId,
    competenceAirtableId,
    competenceId,
    skillAirtableIds,
    skillIds,
    index,
  });
}
