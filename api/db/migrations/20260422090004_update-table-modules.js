const TABLE_NAME = 'modules';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.primary(['id']);
    table.jsonb('glossary').defaultTo([]).notNullable().comment('');
    table.unique(['shortId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropColumn('glossary');
    table.dropUnique(['shortId']);
    table.dropPrimary('modules_pkey');
  });
}
