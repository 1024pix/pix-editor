const TABLE_NAME = 'attachments';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string('id').notNullable().primary();
    table.text('url').notNullable();
    table.integer('size').notNullable();
    table.string('type').notNullable();
    table.string('mimeType').nullable();
    table.string('filename').notNullable();
    table.string('challengeId').nullable().references('challenges.id');
    table.string('localizedChallengeId').notNullable().references('localized_challenges.id');
    table.timestamps(true, true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
