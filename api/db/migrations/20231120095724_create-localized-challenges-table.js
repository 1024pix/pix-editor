/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('localized_challenges', (t) => {
    t.string('id').notNullable().primary();
    t.string('challengeId').notNullable();
    t.string('locale', 20).notNullable();
    t.unique(['challengeId', 'locale']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('localized_challenges');
}
