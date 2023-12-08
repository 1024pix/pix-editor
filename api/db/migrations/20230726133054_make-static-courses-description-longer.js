const TABLE_NAME = 'static_courses';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.string('challengeIds', 1000).notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.string('challengeIds').notNullable().alter();
  });
}
