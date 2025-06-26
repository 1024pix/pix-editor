const TABLE_NAME = 'localized_challenges';
const COLUMN_NAME = 'validatedAt';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dateTime(COLUMN_NAME);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropColumn(COLUMN_NAME);
  });
}
