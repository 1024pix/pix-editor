const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const StaticCourse = require('../../domain/models/StaticCourse');
const courseDatasource = require('../datasources/airtable/course-datasource');

module.exports = {
  // TODO: when double read will be removed, move pagination process into knex
  async findStaticCourses({ page }) {
    const staticCoursesFromPG = await knex('static_courses')
      .select('id', 'name', 'createdAt', 'challengeIds');

    const staticCoursesFromAirtable = await courseDatasource.list();
    const staticCoursesFirstBatch = staticCoursesFromAirtable.map((staticCourseFromAirtable) => {
      return new StaticCourse({
        id: staticCourseFromAirtable.id,
        name: staticCourseFromAirtable.name,
        createdAt: staticCourseFromAirtable.createdAt,
        challengeIds: staticCourseFromAirtable.challenges || [],
      });
    });

    const staticCoursesSecondBatch = staticCoursesFromPG.map((staticCourse) => {
      return new StaticCourse({
        id: staticCourse.id,
        name: staticCourse.name,
        createdAt: staticCourse.createdAt,
        challengeIds: staticCourse.challengeIds.split(','),
      });
    });

    const rowCount = staticCoursesFirstBatch.length + staticCoursesSecondBatch.length;
    const meta = { page: page.number, pageSize: page.size, pageCount: Math.ceil(rowCount / page.size), rowCount };
    const results = _.chain(staticCoursesFirstBatch)
      .concat(staticCoursesSecondBatch)
      .orderBy('createdAt', 'desc')
      .chunk(page.size)
      .nth(page.number - 1).value() || [];
    return { results, meta };
  },
};
