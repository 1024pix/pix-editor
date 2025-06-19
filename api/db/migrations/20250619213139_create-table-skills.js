const TABLE_NAME = 'skills';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.string('id').primary();
    table.string('airtableId').notNullable();
    table.dateTime('activatedAt');
    table.dateTime('archivedAt');
    table.dateTime('obsoletedAt');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
