const TABLE_NAME = 'challenges';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex(TABLE_NAME)
    .where('assessmentMaintenanceTags', '{[]}')
    .update('assessmentMaintenanceTags', null);

  await knex(TABLE_NAME)
    .where('translationMaintenanceTags', '{[]}')
    .update('translationMaintenanceTags', null);
}

/**
 * @returns { Promise<void> }
 */
export async function down() {
}
