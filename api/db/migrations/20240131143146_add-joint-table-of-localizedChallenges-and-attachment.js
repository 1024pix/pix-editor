const TABLE_NAME = 'localized_challenges-attachments';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.string('attachmentId').notNullable();
    table.string('localizedChallengeId').references('localized_challenges.id');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
}
