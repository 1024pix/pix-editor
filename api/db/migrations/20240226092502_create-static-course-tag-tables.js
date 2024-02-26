const TAG_TABLE_NAME = 'static_course_tags';
const ASSOCIATIVE_TABLE_NAME = 'static_courses_tags_link';
const STATIC_COURSE_TABLE_NAME = 'static_courses';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TAG_TABLE_NAME, function(table) {
    table.increments('id').notNullable();
    table.string('label', 30).notNullable();
  });
  await knex.schema.createTable(ASSOCIATIVE_TABLE_NAME, function(table) {
    table.increments('id').notNullable();
    table.bigInteger('staticCourseTagId').references(`${TAG_TABLE_NAME}.id`).index();
    table.string('staticCourseId').references(`${STATIC_COURSE_TABLE_NAME}.id`).index();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(ASSOCIATIVE_TABLE_NAME);
  await knex.schema.dropTable(TAG_TABLE_NAME);
}
