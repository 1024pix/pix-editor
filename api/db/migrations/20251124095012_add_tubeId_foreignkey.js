const TABLE_NAME = 'localized_framework_tubes';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, function(table) {
    table.string('tubeId').notNullable().references('tubes.id').alter();
    table.index('tubeId');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down() {
  // on ne veut pas down
}
