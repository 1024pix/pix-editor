const TABLE_NAME = 'tutorial_external_urls';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.increments('id');
    table.string('competence_name').notNullable();
    table.string('skill_name').notNullable();
    table.string('tutorial_id').notNullable();
    table.text('url').notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
