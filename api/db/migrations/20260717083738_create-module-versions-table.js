const TABLE_NAME = 'module-versions';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.increments('id').notNullable();
    table.uuid('moduleId').notNullable().references('modules.id');
    table.string('version').notNullable();
    table.string('shortId', 8).notNullable();
    table.text('internalTitle').nullable();
    table.string('slug', 100).notNullable();
    table.string('title').notNullable();
    table.boolean('isBeta').notNullable();
    table.string('visibility').notNullable();
    table.text('image').notNullable();
    table.text('description').notNullable();
    table.integer('duration').notNullable();
    table.string('level').notNullable();
    table.string('tabletSupport').notNullable();
    table.specificType('objectives', 'text[]').notNullable();
    table.jsonb('sections').notNullable();
    table.jsonb('glossary').defaultTo([]).notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.unique(['moduleId', 'version']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
