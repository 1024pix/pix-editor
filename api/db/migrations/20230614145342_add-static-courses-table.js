const TABLE_NAME = 'static_courses';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  function table(t) {
    t.string('id').primary();
    t.string('name').notNullable();
    t.string('description').nullable();
    t.string('challengeIds').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
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
