const TABLE_NAME = 'missions';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex(TABLE_NAME).update({ status: 'EXPERIMENTAL' }).where({ status: 'ACTIVE' });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex(TABLE_NAME).update({ status: 'ACTIVE' }).where({ status: 'EXPERIMENTAL' });
}
