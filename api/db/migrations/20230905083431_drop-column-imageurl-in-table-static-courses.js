const TABLE_NAME = 'static_courses';
const IMAGE_URL_COLUMN = 'imageUrl';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(IMAGE_URL_COLUMN);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string(IMAGE_URL_COLUMN);
  });
};
