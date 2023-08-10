const TABLE_NAME = 'static_courses';
const DEACTIVATION_REASON_COLUMN = 'deactivationReason';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string(DEACTIVATION_REASON_COLUMN, 255);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(DEACTIVATION_REASON_COLUMN);
  });
};
