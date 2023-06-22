const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const StaticCourse = require('../../domain/models/StaticCourse');
const courseDatasource = require('../datasources/airtable/course-datasource');

module.exports = {

  async findStaticCourses() {
    const staticCoursesFromPG = await knex('static_courses')
      .select('id', 'name', 'createdAt', 'challengeIds');

    const staticCoursesFromAirtable = await courseDatasource.list();
    const staticCoursesFirstBatch = staticCoursesFromAirtable.map((staticCourseFromAirtable) => {
      return new StaticCourse({
        id: staticCourseFromAirtable.id,
        name: staticCourseFromAirtable.name,
        createdAt: staticCourseFromAirtable.createdAt,
        challengeIds: staticCourseFromAirtable.challenges,
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

    const staticCourses = staticCoursesFirstBatch.concat(staticCoursesSecondBatch);
    return _.orderBy(staticCourses, 'createdAt', 'desc');
  },
};
