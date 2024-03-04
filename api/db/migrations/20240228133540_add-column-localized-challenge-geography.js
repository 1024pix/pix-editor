const TABLE_NAME = 'localized_challenges';
const COLUMN_NAME = 'geography';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.string(COLUMN_NAME, 2).nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(COLUMN_NAME, function(table) {
    table.dropColumn('geography');
  });
}
