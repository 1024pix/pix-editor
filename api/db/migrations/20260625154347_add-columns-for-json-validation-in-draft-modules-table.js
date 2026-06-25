const TABLE_NAME = 'draft-modules';
const COLUMN_NAME_1 = 'hasBeenValidated';
const COLUMN_NAME_2 = 'validationErrors';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.boolean(COLUMN_NAME_1).notNullable().defaultTo(false).comment('Tells if the draft module has a valid structure or not');
    table
      .specificType('validationErrors', 'text[]')
      .nullable()
      .comment('List validation errors if draft module is invalid');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn(COLUMN_NAME_1);
    table.dropColumn(COLUMN_NAME_2);
  });
}
