const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const ChallengeSummary_Read = require('../../domain/readmodels/ChallengeSummary');
const StaticCourse_Read = require('../../domain/readmodels/StaticCourse');
const StaticCourseSummary_Read = require('../../domain/readmodels/StaticCourseSummary');
const StaticCourse = require('../../domain/models/StaticCourse');
const courseDatasource = require('../datasources/airtable/course-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');

module.exports = {
  findReadSummaries,
  getRead,
  get,
  save,
};

// TODO: when double read will be removed, move pagination process into knex
async function findReadSummaries({ page }) {
  const staticCoursesFromPG = await knex('static_courses')
    .select('id', 'name', 'createdAt', 'challengeIds');

  const staticCoursesFromAirtable = await courseDatasource.list();
  const staticCourseIdsFromPG = staticCoursesFromPG.map(({ id }) => id);
  const staticCoursesSummariesFirstBatch = staticCoursesFromAirtable
    .filter((staticCourseFromAirtable) => !staticCourseIdsFromPG.includes(staticCourseFromAirtable.id))
    .map((staticCourseFromAirtable) => {
      return new StaticCourseSummary_Read({
        id: staticCourseFromAirtable.id,
        name: staticCourseFromAirtable.name,
        createdAt: staticCourseFromAirtable.createdAt,
        challengeCount: (staticCourseFromAirtable.challenges || []).length,
      });
    });

  const staticCoursesSummariesSecondBatch = staticCoursesFromPG.map((staticCourse) => {
    return new StaticCourseSummary_Read({
      id: staticCourse.id,
      name: staticCourse.name,
      createdAt: staticCourse.createdAt,
      challengeCount: staticCourse.challengeIds.split(',').length,
    });
  });

  const rowCount = staticCoursesSummariesFirstBatch.length + staticCoursesSummariesSecondBatch.length;
  const meta = { page: page.number, pageSize: page.size, pageCount: Math.ceil(rowCount / page.size), rowCount };
  const results = _.chain(staticCoursesSummariesFirstBatch)
    .concat(staticCoursesSummariesSecondBatch)
    .orderBy('createdAt', 'desc')
    .chunk(page.size)
    .nth(page.number - 1).value() || [];
  return { results, meta };
}

async function getRead(id) {
  const staticCourseFromPG = await knex('static_courses')
    .select('*')
    .where('id', id)
    .first();
  if (staticCourseFromPG) {
    const challengeIds = staticCourseFromPG.challengeIds.split(',');
    const challengeSummaries = await findChallengeSummaries(challengeIds);
    return new StaticCourse_Read({
      id: staticCourseFromPG.id,
      name: staticCourseFromPG.name,
      description: staticCourseFromPG.description,
      createdAt: staticCourseFromPG.createdAt,
      updatedAt: staticCourseFromPG.updatedAt,
      challengeSummaries,
    });
  }
  const [staticCourseFromAirtable] = await courseDatasource.filter({ filter: { ids: [id] } });
  if (staticCourseFromAirtable) {
    const challengeIds = staticCourseFromAirtable.challenges || [];
    const challengeSummaries = await findChallengeSummaries(challengeIds);
    return new StaticCourse_Read({
      id: staticCourseFromAirtable.id,
      name: staticCourseFromAirtable.name || null,
      description: staticCourseFromAirtable.description || null,
      createdAt: staticCourseFromAirtable.createdAt,
      updatedAt: staticCourseFromAirtable.updatedAt,
      challengeSummaries,
    });
  }
  return null;
}

async function get(id) {
  const staticCourseFromPG = await knex('static_courses')
    .select('*')
    .where('id', id)
    .first();
  if (staticCourseFromPG) {
    return new StaticCourse({
      id: staticCourseFromPG.id,
      name: staticCourseFromPG.name,
      description: staticCourseFromPG.description,
      challengeIds: staticCourseFromPG.challengeIds.split(','),
      createdAt: staticCourseFromPG.createdAt,
      updatedAt: staticCourseFromPG.updatedAt,
    });
  }

  const [staticCourseFromAirtable] = await courseDatasource.filter({ filter: { ids: [id] } });
  if (staticCourseFromAirtable) {
    const challengeIds = staticCourseFromAirtable.challenges || [];
    return new StaticCourse({
      id: staticCourseFromAirtable.id,
      name: staticCourseFromAirtable.name || null,
      description: staticCourseFromAirtable.description || null,
      challengeIds,
      createdAt: staticCourseFromAirtable.createdAt,
      updatedAt: staticCourseFromAirtable.updatedAt,
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
    });
  });
}
