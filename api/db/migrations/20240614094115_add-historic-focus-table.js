const TABLE_NAME = 'historic_focus';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function(table) {
    table.increments('id').notNullable();
    table.string('persistantId').notNullable();
    table.text('errorStr');
    table.text('details');
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.boolean('dryRun').notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
