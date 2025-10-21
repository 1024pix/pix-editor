const TABLE_NAME = 'challenges';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.string('id').notNullable().primary();
    table.string('type').nullable();
    table.boolean('t1Status').notNullable();
    table.boolean('t2Status').notNullable();
    table.boolean('t3Status').notNullable();
    table.string('status').nullable();
    table.string('skillId').nullable().references('skills.id');
    table.integer('embedHeight').nullable();
    table.integer('timer').nullable();
    table.string('format').nullable();
    table.boolean('autoReply').notNullable();
    table.specificType('locales', 'varchar(16)[]').notNullable().defaultTo('{}');
    table.boolean('focusable').notNullable();
    table.string('genealogy').nullable();
    table.string('pedagogy').nullable();
    table.specificType('author', 'varchar(16)[]').nullable();
    table.string('declinable').nullable();
    table.integer('version').nullable();
    table.integer('alternativeVersion').nullable();
    table.string('accessibility1').nullable();
    table.string('accessibility2').nullable();
    table.string('spoil').nullable();
    table.string('responsive').nullable();
    table.double('delta').nullable();
    table.double('alpha').nullable();
    table.boolean('shuffled').notNullable();
    table.specificType('contextualizedFields', 'varchar(16)[]').nullable();
    table.timestamps(true, true, true);
    table.timestamp('validatedAt', { useTz: true }).nullable();
    table.timestamp('archivedAt', { useTz: true }).nullable();
    table.timestamp('madeObsoleteAt', { useTz: true }).nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
