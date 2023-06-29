const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const ChallengeSummary = require('../../domain/models/ChallengeSummary');
const StaticCourse = require('../../domain/models/StaticCourse');
const StaticCourseSummary = require('../../domain/models/StaticCourseSummary');
const courseDatasource = require('../datasources/airtable/course-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');

module.exports = {
  // TODO: when double read will be removed, move pagination process into knex
  async findSummaries({ page }) {
    const staticCoursesFromPG = await knex('static_courses')
      .select('id', 'name', 'createdAt', 'challengeIds');

    const staticCoursesFromAirtable = await courseDatasource.list();
    const staticCoursesSummariesFirstBatch = staticCoursesFromAirtable.map((staticCourseFromAirtable) => {
      return new StaticCourseSummary({
        id: staticCourseFromAirtable.id,
        name: staticCourseFromAirtable.name,
        createdAt: staticCourseFromAirtable.createdAt,
        challengeCount: (staticCourseFromAirtable.challenges || []).length,
      });
    });

    const staticCoursesSummariesSecondBatch = staticCoursesFromPG.map((staticCourse) => {
      return new StaticCourseSummary({
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
  },

  async get(id) {
    const staticCourseFromPG = await knex('static_courses')
      .select('*')
      .where('id', id)
      .first();
    if (staticCourseFromPG) {
      const challengeIds = staticCourseFromPG.challengeIds.split(',');
      const challengeSummaries = await _findChallengeSummaries(challengeIds);
      return new StaticCourse({
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
      const challengeSummaries = await _findChallengeSummaries(challengeIds);
      return new StaticCourse({
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
};

async function _findChallengeSummaries(challengeIds) {
  const challengesFromAirtable = await challengeDatasource.filter({ filter: { ids: challengeIds } });
  const skillIds = challengesFromAirtable.map(({ skillId }) => skillId);
  const skillsFromAirtable = await skillDatasource.filter({ filter: { ids: skillIds } });
  return challengeIds.map((challengeId) => {
    const challengeFromAirtable = challengesFromAirtable.find((challengeFromAirtable) => challengeId === challengeFromAirtable.id);
    const correspondingSkill = skillsFromAirtable.find((skill) => skill.id === challengeFromAirtable.skillId);
    return new ChallengeSummary({
      id: challengeFromAirtable.id,
      instruction: challengeFromAirtable.instruction || '',
      skillName: correspondingSkill?.name || '',
      status: challengeFromAirtable.status,
      index: challengeIds.indexOf(challengeFromAirtable.id),
    });
  });
}
