const TABLE_NAME = 'translations';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  function table(t) {
    t.string('key').notNullable();
    t.string('locale', 16).notNullable();
    t.text('value').notNullable();
    t.primary(['key', 'locale']);
  }

  return knex.schema
    .createTable(TABLE_NAME, table);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};
