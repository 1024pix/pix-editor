const Airtable = require('airtable');
const TESTS_TABLE_IN_AIRTABLE_EXISTS = false;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  if (process.env.NODE_ENV !== 'production' || !TESTS_TABLE_IN_AIRTABLE_EXISTS) return;
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
    return {
      id: course.fields['id persistant'],
      name: course.fields['Nom'],
      description: course.fields['Description']?.trim() || '',
      challengeIds: course.fields['Épreuves (id persistant)'].toString(),
      createdAt: course.fields['created_at'],
      updatedAt: course.fields['updated_at'] || course.fields['created_at'],
    };
  });
  console.log('Copying them to PG...');
  await knex.batchInsert('static_courses', cleanedStaticCourses);
  console.log('DONE');
};

/**
 * @returns { Promise<void> }
 */
exports.down = function() {
  console.log('No rollback possible, sorry!');
};
