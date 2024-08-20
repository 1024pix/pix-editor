const TABLE_NAME = 'missions';
const DOCUMENTATION_URL = 'documentationUrl';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.text(DOCUMENTATION_URL);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(DOCUMENTATION_URL);
  });
}
