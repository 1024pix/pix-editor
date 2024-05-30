import _ from 'lodash';

import {
  competenceDatasource,
  skillDatasource,
  tubeDatasource,
  tutorialDatasource
} from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as skillTranslations from '../translations/skill.js';
import { Skill } from '../../domain/models/Skill.js';
import * as airtable from '../airtable.js';

export async function list() {
  const datasourceSkills = await skillDatasource.list();
  const translations = await translationRepository.listByPrefix(skillTranslations.prefix);
  return toDomainList(datasourceSkills, translations);
}

export async function addSpoilData(skills) {
  const SPOIL_COLUMNS = ['Spoil_focus', 'Spoil_variabilisation', 'Spoil_mauvaisereponse', 'Spoil_nouvelacquis'];
  const options = { fields: ['id persistant', ...SPOIL_COLUMNS] };
  const airtableRawObjects = await airtable.findRecords('Acquis', options);

  skills.forEach((skill) => addSpoilDataToSkill(skill, airtableRawObjects));
}

export async function get(id) {
  const [skillDTO] = await skillDatasource.filter({ filter: { ids: [id] } });
  if (!skillDTO) return null;
  const prefix = `${skillTranslations.prefix}${skillDTO.id}`;
  const translations = await translationRepository.listByPrefix(prefix);
  return toDomain(skillDTO, translations);
}

export async function listByTubeId(tubeId) {
  const datasourceSkills = await skillDatasource.filterByTubeId(tubeId);
  if (!datasourceSkills) return [];
  const translations = await translationRepository.listByPrefix(skillTranslations.prefix);
  return toDomainList(datasourceSkills, translations);
}

export async function create(skill) {
  // liens airtable à rétablir :
  // Compétence, Comprendre, En savoir plus, Tube
  const airtableCompetenceId = (await competenceDatasource.getAirtableIdsByIds([skill.competenceId]))[skill.competenceId];
  const airtableTubeId = (await tubeDatasource.getAirtableIdsByIds([skill.tubeId]))[skill.tubeId];
  const airtableTutorialAirtableIdsByIds = await tutorialDatasource.getAirtableIdsByIds([...skill.tutorialIds, ...skill.learningMoreTutorialIds]);
}

function addSpoilDataToSkill(skill, airtableSkills) {
  const airtableSkill = airtableSkills.find((item) => item.get('id persistant') === skill.id);

  skill.spoil_focus = airtableSkill.get('Spoil_focus') || null;
  skill.spoil_variabilisation = airtableSkill.get('Spoil_variabilisation')?.filter((val) => val.length > 0) ?? [];
  skill.spoil_mauvaisereponse = airtableSkill.get('Spoil_mauvaisereponse')?.filter((val) => val.length > 0) ?? [];
  skill.spoil_nouvelacquis = airtableSkill.get('Spoil_nouvelacquis') ?? null;
}

function toDomainList(datasourceSkills, translations) {
  const translationsBySkillId = _.groupBy(translations, 'entityId');
  return datasourceSkills.map(
    (datasourceSkill) => toDomain(datasourceSkill, translationsBySkillId[datasourceSkill.id]),
  );
}

function toDomain(datasourceSkill, translations = []) {
  return new Skill({
    ...datasourceSkill,
    ...skillTranslations.toDomain(translations),
  });
}
