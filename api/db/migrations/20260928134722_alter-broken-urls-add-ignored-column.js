const TABLE_NAME = 'broken_urls';
const IGNORED_COLUMN = 'ignored';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.boolean(IGNORED_COLUMN).defaultTo(false).notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropColumn(IGNORED_COLUMN);
  });
}
