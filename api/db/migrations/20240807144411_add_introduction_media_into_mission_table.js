const TABLE_NAME = 'missions';
const INTRODUCTION_MEDIA_COLUMN = 'introductionMedia';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.text(INTRODUCTION_MEDIA_COLUMN);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(INTRODUCTION_MEDIA_COLUMN);
  });
}
