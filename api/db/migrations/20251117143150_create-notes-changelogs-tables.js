/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('changelog_entries', function(table) {
    table.string('id').primary().notNullable();
    table.text('text').notNullable();
    table.string('author').notNullable();
    table.string('elementId').notNullable();
    table.string('elementType').nullable();
    table.timestamp('createdAt');
  });

  await knex.schema.createTable('notes', function(table) {
    table.string('id').primary().notNullable();
    table.string('status').nullable();
    table.text('text').notNullable();
    table.string('author').notNullable();
    table.string('challengeId').notNullable();
    table.timestamps(true, true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('changelog_entries');
  await knex.schema.dropTable('notes');
}
