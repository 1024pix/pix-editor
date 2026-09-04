const TABLE_NAME = 'external_urls-tutorials';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.integer('externalUrlId').notNullable().references('external_urls.id');
    table.string('tutorialId').notNullable().references('tutorials.id');
    table.primary(['externalUrlId', 'tutorialId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
