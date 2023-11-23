import { Client } from 'pg';
import Airtable from 'airtable';

(async function() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    console.log('reading all static courses from Airtable...');
    const allStaticCourses = await airtableClient.table('Tests').select({
      fields: ['id persistant', 'Nom', 'Description', 'Épreuves (id persistant)', 'created_at', 'updated_at', 'Nb d\'épreuves'],
    }).all();
    console.log('done');

    const filteredStaticCourses = allStaticCourses
      .filter((course) => course.fields['Nom'] != null
                && course.fields['Nb d\'épreuves'] !== 0
                && course.fields['Épreuves (id persistant)'].toString().length <= 1000
      );
    console.log(filteredStaticCourses.length);

    const cleanedStaticCourses = filteredStaticCourses.map((course) => {
      const challengeIds = course.fields['Épreuves (id persistant)'].toString().split(',');
      const reversedChallengeIds = challengeIds.reverse();
      return {
        id: course.fields['id persistant'],
        name: course.fields['Nom'],
        description: course.fields['Description']?.trim() || '',
        challengeIds: reversedChallengeIds.toString(),
        createdAt: course.fields['created_at'],
        updatedAt: course.fields['updated_at'] || course.fields['created_at'],
        isActive: true,
      };
    });
    console.log('Copying them to PG...');
    await client.connect();
    await client.query('BEGIN');
    for (const cleanedStaticCourse of cleanedStaticCourses) {
      await client.query('INSERT INTO static_courses (id, name, description, "challengeIds", "createdAt", "updatedAt", "isActive") VALUES ($1, $2, $3, $4, $5, $6, $7)', [
        cleanedStaticCourse.id,
        cleanedStaticCourse.name,
        cleanedStaticCourse.description,
        cleanedStaticCourse.challengeIds,
        cleanedStaticCourse.createdAt,
        cleanedStaticCourse.updatedAt,
        cleanedStaticCourse.isActive,
      ]);
    }
    await client.query('COMMIT');
    console.log('DONE');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.end();
  }
})();

