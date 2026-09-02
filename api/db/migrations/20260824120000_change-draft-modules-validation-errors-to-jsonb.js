const TABLE_NAME = 'draft-modules';
const COLUMN_NAME = 'validationErrors';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropColumn(COLUMN_NAME);
  });
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table
      .jsonb(COLUMN_NAME)
      .nullable()
      .comment('List validation errors ({ message, isSchemaError }) if draft module is invalid');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.dropColumn(COLUMN_NAME);
  });
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table
      .specificType(COLUMN_NAME, 'text[]')
      .nullable()
      .comment('List validation errors if draft module is invalid');
  });
}
