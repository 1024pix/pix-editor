const TABLE_NAME = 'focus_phrase';

const COLUMN_NAME = 'originPersistantId';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.string(COLUMN_NAME).notNullable().defaultTo('null');
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
