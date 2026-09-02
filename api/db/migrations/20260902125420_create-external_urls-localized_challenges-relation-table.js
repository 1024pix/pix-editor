const TABLE_NAME = 'external_urls-localized_challenges';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.integer('externalUrlId').notNullable().references('external_urls.id');
    table.string('localizedChallengeId').notNullable().references('localized_challenges.id');
    table.primary(['externalUrlId', 'localizedChallengeId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
