const TABLE_NAME = 'localized_challenges';
const COLUMN_NAME = 'isIncompatibleIpadCertif';

export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.boolean(COLUMN_NAME).defaultTo(false).notNullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropColumn(COLUMN_NAME);
  });
}
