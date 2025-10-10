const TABLE_NAME = 'skills';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.string('status').nullable();
    table.string('hintStatus').nullable();
    table.string('descriptionStatus').nullable();
    table.string('description').nullable();
    table.integer('level').nullable();
    table.string('internationalisation').nullable();
    table.integer('version').nullable();
    table.string('tubeId').nullable().references('tubes.id');
    table.timestamps(true, true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumns('status', 'hintStatus', 'descriptionStatus', 'description', 'level', 'internationalisation', 'version', 'tubeId');
    table.dropTimestamps(true);
  });
}
