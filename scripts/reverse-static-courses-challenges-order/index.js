import { knex } from '../../api/db/knex-database-connection';

(async function() {
  const staticCourses = await knex('static_courses')
    .select('id', 'name', 'challengeIds');
  for (const staticCourse of staticCourses) {
    const challengeIds = staticCourse.challengeIds.split(',');
    const reversedChallengeIds = challengeIds.reverse();
    await knex('static_courses')
      .where('id', staticCourse.id)
      .update({
        challengeIds: reversedChallengeIds.join(','),
      });
  }
})();

