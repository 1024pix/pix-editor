/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('modules', function(table) {
    table.string('version').notNullable().alter();
  });
  await knex.schema.alterTable('draft-modules', function(table) {
    table.string('version').notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('modules', function(table) {
    table.string('version').nullable().alter();
  });
  await knex.schema.alterTable('draft-modules', function(table) {
    table.string('version').nullable().alter();
  });
}
