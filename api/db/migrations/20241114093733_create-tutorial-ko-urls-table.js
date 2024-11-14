const TABLE_NAME = 'tutorial_ko_urls';

export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.text('url').notNullable().primary();
    table.integer('continuousKoCount').notNullable().defaultTo(0);
  });
}

export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
