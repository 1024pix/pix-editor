/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('modules', function(table) {
    table.text('internalTitle').nullable().unique();
  });
  await knex.schema.alterTable('draft-modules', function(table) {
    table.text('internalTitle').nullable().unique();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('modules', function(table) {
    table.dropColumn('internalTitle');
  });
  await knex.schema.alterTable('draft-modules', function(table) {
    table.dropColumn('internalTitle');
  });
}
