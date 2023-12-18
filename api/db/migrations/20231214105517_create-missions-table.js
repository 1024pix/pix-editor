/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('missions', (t) => {
    t.increments('id').primary();
    t.string('competenceId');
    t.string('thematicId');
    t.string('status').notNullable().defaultTo('INACTIVE');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('missions');
}
