const TABLE_NAME = 'focus_phrase';

const COLUMN_NAME = 'scriptExectId';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    // refers to 21/06/2024 at midnight
    table.string(COLUMN_NAME).notNullable().defaultTo('1718928000000');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(COLUMN_NAME);
  });
}
