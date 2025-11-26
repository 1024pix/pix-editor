/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable('changelog_entries', function(table) {
    table.index('elementId');
  });
  await knex.schema.alterTable('notes', function(table) {
    table.index('challengeId');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('changelog_entries', function(table) {
    table.dropIndex('elementId');
  });
  await knex.schema.alterTable('notes', function(table) {
    table.dropIndex('challengeId');
  });
}
