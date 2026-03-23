const TABLE_NAME = 'translations_config';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.increments('id').notNullable();
    table.string('phraseProjectId').notNullable();
    table.string('frameworkId').notNullable().references('frameworks.id');
    table.string('areaId').nullable().references('areas.id');
    table.json('uploadedLocales').notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
