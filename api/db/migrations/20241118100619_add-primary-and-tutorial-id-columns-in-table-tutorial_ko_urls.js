const TABLE_NAME = 'tutorial_ko_urls';

export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.increments('id').primary();
    table.string('tutorialId').notNullable();
  });
}

export async function down() {}
