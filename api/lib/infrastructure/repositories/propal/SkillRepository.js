import _ from 'lodash';

import { skillDatasource } from '../../datasources/airtable/index.js';
import * as skillTranslations from '../../translations/skill.js';
import { Skill } from '../../../domain/models/Skill.js';
import { Translation } from '../../../domain/models/index.js';
import { KnexRepository } from './KnexRepository.js';
import { TranslationRepository } from './TranslationRepository.js';

export class SkillRepository extends KnexRepository {
  static model = 'skill';

  constructor({ knexTransaction } = {}) {
    super({ knexTransaction });
    this.translationRepository = new TranslationRepository({ knexTransaction: this.dbConn });
  }

  async list() {
    const [datasourceSkills, translations] = await Promise.all([
      skillDatasource.list(),
      this.translationRepository.listByModel(SkillRepository.model),
    ]);
    return toDomainList(datasourceSkills, translations);
  }

  async get(id) {
    const [[skillDTO], translations] = await Promise.all([
      skillDatasource.filter({ filter: { ids: [id] } }),
      this.translationRepository.listByEntity(SkillRepository.model, id),
    ]);
    if (!skillDTO) return null;
    return toDomain(skillDTO, translations);
  }

  async getByAirtableId(id) {
    const datasourceSkill = await skillDatasource.find(id);
    if (!datasourceSkill) return null;
    const translations = await this.translationRepository.listByEntity(SkillRepository.model, datasourceSkill.id);
    return toDomain(datasourceSkill, translations);
  }

  async getManyByAirtableIds(ids) {
    if (!ids?.length) return [];
    const datasourceSkills = await skillDatasource.getManyByAirtableIds(ids);
    if (!datasourceSkills) return [];
    const translations = await this.translationRepository.listByEntities(SkillRepository.model, datasourceSkills.map(({ id }) => id));
    return toDomainList(datasourceSkills, translations);
  }

  async listByTubeId(tubeId) {
    const datasourceSkills = await skillDatasource.filterByTubeId(tubeId);
    if (!datasourceSkills) return [];
    const translations = await this.translationRepository.listByEntities(SkillRepository.model, datasourceSkills.map(({ id }) => id));
    return toDomainList(datasourceSkills, translations);
  }

  async listActiveByCompetenceId(competenceId) {
    const datasourceSkills = await skillDatasource.listActiveByCompetenceId(competenceId);
    if (!datasourceSkills) return [];
    const translations = await this.translationRepository.listByEntities(SkillRepository.model, datasourceSkills.map(({ id }) => id));
    return toDomainList(datasourceSkills, translations);
  }

  async listByCompetenceId(competenceId) {
    const datasourceSkills = await skillDatasource.listByCompetenceId(competenceId);
    if (!datasourceSkills) return [];
    const translations = await this.translationRepository.listByEntities(SkillRepository.model, datasourceSkills.map(({ id }) => id));
    return toDomainList(datasourceSkills, translations);
  }

  async search(params) {
    const datasourceSkills = await skillDatasource.search(params);
    if (!datasourceSkills) return [];
    const translations = await this.translationRepository.listByEntities(SkillRepository.model, datasourceSkills.map(({ id }) => id));
    return toDomainList(datasourceSkills, translations);
  }

  async create(skill) {
    const createdSkillDTO = await skillDatasource.create(skill);
    const translations = [];
    for (const [locale, value] of Object.entries(skill.hint_i18n)) {
      if (!value) continue;
      translations.push(new Translation({
        key: `${SkillRepository.model}.${skill.id}.hint`,
        locale,
        value,
      }));
    }
    await this.translationRepository.save({ translations });
    return toDomain(createdSkillDTO, translations);
  }

  async update(skill) {
    const updatedSkillDto = await skillDatasource.update(skill);
    const translations = skillTranslations.extractFromDomainObject(skill);
    await this.translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${skillTranslations.prefix}${skill.id}.`,
      locales: ['fr', 'en'],
    });
    await this.translationRepository.save({ translations });

    return toDomain(updatedSkillDto, translations);
  }
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
