const TABLE_NAME = 'trainings';
export function up(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
}

export function down() {

}
