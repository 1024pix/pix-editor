const { knex } = require('../../../db/knex-database-connection');
const { fetchPage } = require('../utils/knex-utils');
const ChallengeSummary_Read = require('../../domain/readmodels/ChallengeSummary');
const StaticCourse_Read = require('../../domain/readmodels/StaticCourse');
const StaticCourseSummary_Read = require('../../domain/readmodels/StaticCourseSummary');
const StaticCourse = require('../../domain/models/StaticCourse');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');

module.exports = {
  findReadSummaries,
  getRead,
  get,
  save,
};

async function findReadSummaries({ filter, page }) {
  const query = knex('static_courses')
    .select('id', 'name', 'createdAt', 'challengeIds', 'isActive')
    .orderBy('createdAt', 'desc');
  if (filter.isActive !== null) {
    query.where('isActive', filter.isActive);
  }
  const { results: staticCourses, pagination } = await fetchPage(query, page);

  const staticCoursesSummaries = staticCourses.map((staticCourse) => {
    return new StaticCourseSummary_Read({
      id: staticCourse.id,
      name: staticCourse.name || '',
      createdAt: staticCourse.createdAt,
      challengeCount: staticCourse.challengeIds.split(',').length,
      isActive: staticCourse.isActive,
    });
  });

  return { results: staticCoursesSummaries, meta: pagination };
}

async function getRead(id) {
  const staticCourse = await knex('static_courses')
    .select('*')
    .where('id', id)
    .first();
  if (staticCourse) {
    const challengeIds = staticCourse.challengeIds.split(',');
    const challengeSummaries = await findChallengeSummaries(challengeIds);
    return new StaticCourse_Read({
      id: staticCourse.id,
      name: staticCourse.name,
      description: staticCourse.description,
      isActive: staticCourse.isActive,
      deactivationReason: staticCourse.deactivationReason || '',
      createdAt: staticCourse.createdAt,
      updatedAt: staticCourse.updatedAt,
      challengeSummaries,
    });
  }
  return null;
}

async function get(id) {
  const staticCourse = await knex('static_courses')
    .select('*')
    .where('id', id)
    .first();
  if (staticCourse) {
    return new StaticCourse({
      id: staticCourse.id,
      name: staticCourse.name,
      description: staticCourse.description,
      challengeIds: staticCourse.challengeIds.split(','),
      isActive: staticCourse.isActive,
      createdAt: staticCourse.createdAt,
      updatedAt: staticCourse.updatedAt,
    });
  }
  return null;
}

async function save(staticCourseForCreation) {
  const staticCourseDTO = staticCourseForCreation.toDTO();
  const serializedStaticCourseForDB = {
    id: staticCourseDTO.id,
    name: staticCourseDTO.name,
    description: staticCourseDTO.description,
    challengeIds: staticCourseDTO.challengeIds.join(','),
    isActive: staticCourseDTO.isActive,
    deactivationReason: staticCourseDTO.deactivationReason,
    createdAt: staticCourseDTO.createdAt,
    updatedAt: staticCourseDTO.updatedAt,
  };
  await knex('static_courses')
    .insert(serializedStaticCourseForDB)
    .onConflict('id')
    .merge();
  return serializedStaticCourseForDB.id;
}

async function findChallengeSummaries(challengeIds) {
  const challengesFromAirtable = await challengeDatasource.filter({ filter: { ids: challengeIds } });
  const skillIds = challengesFromAirtable.map(({ skillId }) => skillId);
  const skillsFromAirtable = await skillDatasource.filter({ filter: { ids: skillIds } });
  return challengeIds.map((challengeId) => {
    const challengeFromAirtable = challengesFromAirtable.find((challengeFromAirtable) => challengeId === challengeFromAirtable.id);
    const correspondingSkill = skillsFromAirtable.find((skill) => skill.id === challengeFromAirtable.skillId);
    return new ChallengeSummary_Read({
      id: challengeFromAirtable.id,
      instruction: challengeFromAirtable.instruction || '',
      skillName: correspondingSkill?.name || '',
      status: challengeFromAirtable.status,
      index: challengeIds.indexOf(challengeFromAirtable.id),
      previewUrl: challengeFromAirtable.preview,
    });
  });
}
