import {
  areaDatasource,
  attachmentDatasource,
  competenceDatasource,
  skillDatasource,
  thematicDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../../infrastructure/datasources/airtable/index.js';
import * as competenceTranslations from '../../infrastructure/translations/competence.js';
import { challengeRepository, translationRepository } from '../../infrastructure/repositories/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import * as skillTranslations from '../../infrastructure/translations/skill.js';

export async function getLearningContentForReplication(dependencies = { translationRepository }) {
  const { translationRepository } = dependencies;

  const [
    areas,
    competences,
    tubes,
    skills,
    challenges,
    tutorials,
    attachments,
    thematics,
    courses,
    translations,
  ] = await Promise.all([
    areaDatasource.list(),
    competenceDatasource.list(),
    tubeDatasource.list(),
    skillDatasource.list(),
    challengeRepository.list(),
    tutorialDatasource.list(),
    attachmentDatasource.list(),
    thematicDatasource.list(),
    _getCoursesFromPGForReplication(),
    translationRepository.listByPrefixes([competenceTranslations.prefix, skillTranslations.prefix]),
  ]);

  competences.forEach((competence) => {
    competenceTranslations.hydrateReleaseObject(competence, translations);
  });

  skills.forEach((skill) => {
    skillTranslations.hydrateReleaseObject(skill, translations);
  });

  return {
    areas,
    competences,
    tubes,
    skills,
    challenges,
    tutorials,
    attachments,
    thematics,
    courses
  };
}

async function _getCoursesFromPGForReplication() {
  return knex('static_courses')
    .select(['id', 'name'])
    .orderBy('id');
}

