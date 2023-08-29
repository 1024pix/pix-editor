const areaDatasource = require('../../infrastructure/datasources/airtable/area-datasource');
const competenceDatasource = require('../../infrastructure/datasources/airtable/competence-datasource');
const tubeDatasource = require('../../infrastructure/datasources/airtable/tube-datasource');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const challengeDatasource = require('../../infrastructure/datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../../infrastructure/datasources/airtable/tutorial-datasource');
const attachmentDatasource = require('../../infrastructure/datasources/airtable/attachment-datasource');
const thematicDatasource = require('../../infrastructure/datasources/airtable/thematic-datasource');
const tablesTranslations = require('../../infrastructure/translations');
const translationRepository = require('../../infrastructure/repositories/translation-repository');
const { knex } = require('../../../db/knex-database-connection');

async function getLearningContentForReplication(dependencies = { translationRepository }) {
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
    challengeDatasource.list(),
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

module.exports = {
  getLearningContentForReplication: getLearningContentForReplication,
};
