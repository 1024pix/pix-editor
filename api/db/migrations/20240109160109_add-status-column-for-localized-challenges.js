const TABLE_NAME = 'localized_challenges';
const STATUS_COLUMN = 'status';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.string(STATUS_COLUMN, 255);
  });
  await knex(TABLE_NAME).update({
    [STATUS_COLUMN]: 'proposé'
  }).where('id', '<>', knex.ref('challengeId'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(STATUS_COLUMN);
  });
}

