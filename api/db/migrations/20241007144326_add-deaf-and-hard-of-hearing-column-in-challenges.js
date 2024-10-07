const TABLE_NAME = 'localized_challenges';
const COLUMN_NAME = 'deafAndHardOfHearing';

export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.string(COLUMN_NAME, 10).defaultTo('RAS').notNullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropColumn(COLUMN_NAME);
  });
}
