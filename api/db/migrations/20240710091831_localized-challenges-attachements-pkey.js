const TABLE_NAME = 'localized_challenges-attachments';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropNullable('localizedChallengeId');
    table.primary(['localizedChallengeId', 'attachmentId']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropPrimary();
    table.setNullable('localizedChallengeId');
  });
}
