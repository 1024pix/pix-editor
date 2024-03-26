const TABLE_NAME = 'localized_challenges';
const COLUMN_NAME = 'urlsToConsult';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.specificType(COLUMN_NAME, 'text[]').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(COLUMN_NAME);
  });
}
