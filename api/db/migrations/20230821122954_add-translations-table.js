const TABLE_NAME = 'translations';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  function table(t) {
    t.string('key').notNullable();
    t.string('locale').notNullable();
    t.string('value').notNullable();
    t.primary(['key', 'locale']);
  }

  return knex.schema
    .createTable(TABLE_NAME, table);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};
