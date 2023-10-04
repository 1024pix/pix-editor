import {
  areaDatasource,
  attachmentDatasource,
  competenceDatasource,
  skillDatasource,
  thematicDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../../infrastructure/datasources/airtable/index.js';
import * as tablesTranslations from '../../infrastructure/translations/index.js';
import { challengeRepository, translationRepository } from '../../infrastructure/repositories/index.js';
import { knex } from '../../../db/knex-database-connection.js';

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
  ]);

  const translations = await translationRepository.list();

  competences.forEach((competence) => {
    const tableTranslations = tablesTranslations['Competences'];
    tableTranslations.hydrateReleaseObject(competence, translations);
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

