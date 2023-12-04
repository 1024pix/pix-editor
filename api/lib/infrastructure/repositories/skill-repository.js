import _ from 'lodash';

import { skillDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as skillTranslations from '../translations/skill.js';
import { Skill } from '../../domain/models/Skill.js';

export async function list() {
  const datasourceSkills = await skillDatasource.list();
  const translations = await translationRepository.listByPrefix(skillTranslations.prefix);
  return toDomainList(datasourceSkills, translations);
}

function toDomainList(datasourceSkills, translations) {
  const translationsBySkillId = _.groupBy(translations, ({ key }) => key.split('.')[1]);
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
