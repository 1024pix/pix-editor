const TABLE_NAME = 'draft-module-versions';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.increments('id').notNullable();
    table.uuid('draftModuleId').notNullable().references('draft-modules.id').onDelete('CASCADE');
    table.string('version').notNullable();
    table.jsonb('structuredDiff').notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
