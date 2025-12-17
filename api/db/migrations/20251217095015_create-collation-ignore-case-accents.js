/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw('CREATE COLLATION IF NOT EXISTS "ignore-case-accents" (provider = icu, deterministic = false, locale = \'und-u-ks-level1\');');
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw('DROP COLLATION "ignore-case-accents";');
}
