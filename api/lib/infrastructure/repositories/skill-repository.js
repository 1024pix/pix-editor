import _ from 'lodash';

import { skillDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as skillTranslations from '../translations/skill.js';
import { Skill } from '../../domain/models/Skill.js';
import { Translation } from '../../domain/models/index.js';
import { knex } from '../../../db/knex-database-connection.js';

const model = 'skill';

export async function list() {
  const [datasourceSkills, translations] = await Promise.all([
    skillDatasource.list(),
    translationRepository.listByModel(model),
  ]);
  const skillsDataFromPG = await knex('skills').select('*');
  return toDomainList(datasourceSkills, translations, skillsDataFromPG);
}

export async function get(id) {
  const [[skillDTO], translations] = await Promise.all([
    skillDatasource.filter({ filter: { ids: [id] } }),
    translationRepository.listByEntity(model, id),
  ]);
  if (!skillDTO) return null;
  const skillDataFromPG = await knex('skills').select('*').where({ id }).first();
  return toDomain(skillDTO, translations, skillDataFromPG);
}

export async function getByAirtableId(id) {
  const datasourceSkill = await skillDatasource.find(id);
  if (!datasourceSkill) return null;
  const translations = await translationRepository.listByEntity(model, datasourceSkill.id);
  const skillDataFromPG = await knex('skills').select('*').where({ id: datasourceSkill.id }).first();
  return toDomain(datasourceSkill, translations, skillDataFromPG);
}

export async function getManyByAirtableIds(ids) {
  if (!ids?.length) return [];
  const datasourceSkills = await skillDatasource.getManyByAirtableIds(ids);
  if (!datasourceSkills) return [];
  const translations = await translationRepository.listByEntities(model, datasourceSkills.map(({ id }) => id));
  const skillsDataFromPG = await knex('skills').select('*').whereIn('id', datasourceSkills.map(({ id }) => id));
  return toDomainList(datasourceSkills, translations, skillsDataFromPG);
}

export async function listByTubeId(tubeId) {
  const datasourceSkills = await skillDatasource.filterByTubeId(tubeId);
  if (!datasourceSkills) return [];
  const translations = await translationRepository.listByEntities(model, datasourceSkills.map(({ id }) => id));
  const skillsDataFromPG = await knex('skills').select('*').whereIn('id', datasourceSkills.map(({ id }) => id));
  return toDomainList(datasourceSkills, translations, skillsDataFromPG);
}

export async function listActiveByCompetenceId(competenceId) {
  const datasourceSkills = await skillDatasource.listActiveByCompetenceId(competenceId);
  if (!datasourceSkills) return [];
  const translations = await translationRepository.listByEntities(model, datasourceSkills.map(({ id }) => id));
  const skillsDataFromPG = await knex('skills').select('*').whereIn('id', datasourceSkills.map(({ id }) => id));
  return toDomainList(datasourceSkills, translations, skillsDataFromPG);
}

export async function listByCompetenceId(competenceId) {
  const datasourceSkills = await skillDatasource.listByCompetenceId(competenceId);
  if (!datasourceSkills) return [];
  const translations = await translationRepository.listByEntities(model, datasourceSkills.map(({ id }) => id));
  const skillsDataFromPG = await knex('skills').select('*').whereIn('id', datasourceSkills.map(({ id }) => id));
  return toDomainList(datasourceSkills, translations, skillsDataFromPG);
}

export async function search(params) {
  const datasourceSkills = await skillDatasource.search(params);
  if (!datasourceSkills) return [];
  const translations = await translationRepository.listByEntities(model, datasourceSkills.map(({ id }) => id));
  const skillsDataFromPG = await knex('skills').select('*').whereIn('id', datasourceSkills.map(({ id }) => id));
  return toDomainList(datasourceSkills, translations, skillsDataFromPG);
}

export async function create(skill) {
  const createdSkillDTO = await skillDatasource.create(skill);
  const translations = [];
  for (const [locale, value] of Object.entries(skill.hint_i18n)) {
    if (!value) continue;
    translations.push(new Translation({
      key: `${model}.${skill.id}.hint`,
      locale,
      value,
    }));
  }
  await translationRepository.save({ translations });
  const skillDataFromPG = await knex('skills').select('*').where({ id: createdSkillDTO.id }).first();
  return toDomain(createdSkillDTO, translations, skillDataFromPG);
}

export async function update(skill) {
  return knex.transaction(async (transaction) => {
    const updatedSkillDto = await skillDatasource.update(skill);
    const translations = skillTranslations.extractFromDomainObject(skill);
    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${skillTranslations.prefix}${skill.id}.`,
      locales: ['fr', 'en'],
      transaction,
    });
    const skillDataToSaveInPG = extractDataForPG(skill);
    const [skillDataFromPG] = await knex('skills').insert(skillDataToSaveInPG).onConflict('id').merge().returning('*');
    await translationRepository.save({ translations, transaction });
    return toDomain(updatedSkillDto, translations, skillDataFromPG);
  });
}

function toDomainList(datasourceSkills, translations, skillsDataFromPG) {
  const translationsBySkillId = _.groupBy(translations, 'entityId');
  const skillDataFromPGBySkillId = _.groupBy(skillsDataFromPG, 'id');
  return datasourceSkills.map(
    (datasourceSkill) => toDomain(datasourceSkill, translationsBySkillId[datasourceSkill.id], skillDataFromPGBySkillId[datasourceSkill.id]?.[0] ?? null),
  );
}

function toDomain(datasourceSkill, translations = [], skillDataFromPG) {
  return new Skill({
    ...datasourceSkill,
    ...skillTranslations.toDomain(translations),
    activatedAt: skillDataFromPG?.activatedAt ?? null,
    archivedAt: skillDataFromPG?.archivedAt ?? null,
    obsoletedAt: skillDataFromPG?.obsoletedAt ?? null,
  });
}

function extractDataForPG(skill) {
  return {
    id: skill.id,
    activatedAt: skill.activatedAt,
    archivedAt: skill.archivedAt,
    obsoletedAt: skill.obsoletedAt,
  };
}
