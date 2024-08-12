const TABLE_NAME = 'missions';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.renameColumn('introductionMedia', 'introductionMediaUrl');
  });

  await knex.schema.table(TABLE_NAME, function(table) {
    table.string('introductionMediaType').nullable();
    table.string('introductionMediaAlt').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.renameColumn('introductionMediaUrl', 'introductionMedia');
  });
  await knex.schema.table(TABLE_NAME, function(table) {
    table.dropColumn('introductionMediaType');
    table.dropColumn('introductionMediaAlt');
  });
}
