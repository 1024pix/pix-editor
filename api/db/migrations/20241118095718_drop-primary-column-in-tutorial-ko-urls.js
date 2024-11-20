const TABLE_NAME = 'tutorial_ko_urls';

export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropPrimary('tutorial_ko_urls_pkey');
  });
}

export async function down() {}
