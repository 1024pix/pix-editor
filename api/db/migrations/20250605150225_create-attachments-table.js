const TABLE_NAME = 'attachments';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.string('id').primary();
    table.string('airtableId').notNullable();
    table.string('filename').notNullable();
    table.string('url').notNullable();
    table.enum('type', ['attachment', 'illustration']).notNullable();
    table.integer('size').notNullable();
    table.string('mimeType');
    table.string('challengeId');
    table.string('airtableChallengeId');
    table.string('localizedChallengeId').references('localized_challenges.id').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
