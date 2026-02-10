const TABLE_NAME = 'embeds';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('embeds', (t) => {
    t.increments('id').notNullable();
    t.string('name').notNullable().unique();
    t.text('pathname').notNullable();
    t.json('redirections');
    t.string('ref');
    t.text('manifestPath').notNullable();
    t.string('manifestSha').notNullable();
    t.specificType('localesDirectories', 'text[]');
    t.string('configDirectory');
    t.timestamps(true, true, true);
  });

  await knex.schema.createTable('embed_configs', (t) => {
    t.increments('id').notNullable();
    t.integer('embedId').notNullable().references('embeds.id');
    t.string('name').notNullable();
    t.jsonb('data').notNullable();
    t.string('sha');
    t.timestamps(true, true, true);
    t.unique(['embedId', 'name']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('embed_configs');
  await knex.schema.dropTable('embeds');
}
