const TABLE_NAME = 'static_courses';
const IS_ACTIVE_COLUMN = 'isActive';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.boolean(IS_ACTIVE_COLUMN).notNullable().defaultTo(true);
  });
  return knex.raw('ALTER TABLE ?? ALTER COLUMN ?? DROP DEFAULT', [TABLE_NAME, IS_ACTIVE_COLUMN]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(IS_ACTIVE_COLUMN);
  });
};
