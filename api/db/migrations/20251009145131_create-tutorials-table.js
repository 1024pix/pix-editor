const TABLE_NAME = 'tutorials';
const RELATIONSHIPS_TABLE_NAME = 'tutorials-tutorial_tags';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.string('id').primary().notNullable();
    table.string('title').notNullable();
    table.string('duration').notNullable();
    table.string('source').notNullable();
    table.string('format').notNullable();
    table.string('link').notNullable();
    table.string('license').nullable();
    table.string('level').nullable();
    table.boolean('crush').notNullable().defaultTo(false);
    table.string('locale').notNullable();

    table.timestamps(true, true, true);
  });

  await knex.schema.createTable(RELATIONSHIPS_TABLE_NAME, function(table) {
    table.string('tutorialId').notNullable().references('tutorials.id');
    table.string('tutorialTagId').notNullable().references('tutorial_tags.id');
    table.primary(['tutorialId', 'tutorialTagId']);

    table.timestamps(true, true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(RELATIONSHIPS_TABLE_NAME);
  await knex.schema.dropTable(TABLE_NAME);
}
