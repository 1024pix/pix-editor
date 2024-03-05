const TABLE_NAME = 'static_courses_tags_link';
const COLUMN_A = 'staticCourseId';
const COLUMN_B = 'staticCourseTagId';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string(COLUMN_A).alter({ alterNullable : false });
    table.bigInteger(COLUMN_B).alter({ alterNullable : false });
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string(COLUMN_A).alter({ alterNullable : true });
    table.bigInteger(COLUMN_B).alter({ alterNullable : true });
  });
}

