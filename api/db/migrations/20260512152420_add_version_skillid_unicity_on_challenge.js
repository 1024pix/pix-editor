/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
      CREATE UNIQUE INDEX IF NOT EXISTS challenges_skillid_version_uniq
      ON "challenges"("version", "skillId") where genealogy='Prototype 1';
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.raw(`
      DROP INDEX IF EXISTS challenges_skillid_version_uniq
    `);
}
