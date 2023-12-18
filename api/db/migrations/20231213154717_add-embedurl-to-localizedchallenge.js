const TABLE_NAME = 'localized_challenges';
const EMBED_URL_COLUMN = 'embedUrl';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.text(EMBED_URL_COLUMN);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(EMBED_URL_COLUMN);
  });
}
