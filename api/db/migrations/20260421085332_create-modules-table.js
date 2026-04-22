const TABLE_NAME = 'modules';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.uuid('id').notNullable().defaultTo(knex.fn.uuid());
    table.string('shortId', 8).notNullable().comment('used for permanent url');
    table.string('slug', 100).notNullable().comment('used for user-friendly url');
    table.string('title').notNullable();
    table.boolean('isBeta').notNullable().defaultTo(true).comment('draft status of the module');
    table.string('visibility').notNullable().comment('controls visibility in trainings configuration');
    table.text('image').notNullable().comment('url');
    table.text('description').notNullable().comment('may contain html content');
    table.integer('duration').notNullable().comment('duration of the module in minutes');
    table.string('level').notNullable();
    table.string('tabletSupport').notNullable().comment('convenientness level of module reading on small screens');
    table.specificType('objectives', 'text[]').notNullable().comment('objectives of the module. May contain html content');
    table.jsonb('sections').notNullable().comment('main content of the module');
    table.timestamps(true, true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
