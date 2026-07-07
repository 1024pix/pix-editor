/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('modules', function(table) {
    table.string('version').nullable();
  });
  await knex.schema.alterTable('draft-modules', function(table) {
    table.string('version').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('modules', function(table) {
    table.dropColumn('version');
  });
  await knex.schema.alterTable('draft-modules', function(table) {
    table.dropColumn('version');
  });
}
