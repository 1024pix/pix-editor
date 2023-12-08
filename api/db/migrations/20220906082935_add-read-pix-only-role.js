const TABLE_NAME = 'users';

export function up(knex) {
  return knex.schema.raw(`
    ALTER TABLE "users"
    DROP CONSTRAINT "users_access_check",
    ADD CONSTRAINT "users_access_check"
    CHECK (access IN ('readpixonly', 'readonly', 'replicator', 'editor', 'admin'))
  `);
}

export async function down(knex) {
  await knex(TABLE_NAME).update({
    access: 'readonly'
  }).where('access', 'readpixonly');

  return knex.schema.raw(`
    ALTER TABLE "users"
    DROP CONSTRAINT "users_access_check",
    ADD CONSTRAINT "users_access_check"
    CHECK (access IN ('readonly', 'replicator', 'editor', 'admin'))
  `);
}
