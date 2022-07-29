const TABLE_NAME = 'trainings';

exports.up = (knex) => {

  function table(t) {
    t.increments().primary();
    t.string('title').notNullable();
    t.string('link').notNullable();
    t.string('type').notNullable();
    t.specificType('duration', 'interval').notNullable();
    t.string('locale').notNullable();
    t.specificType('targetProfileIds', 'int[]').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table);
};

exports.down = (knex) => {

  return knex.schema
    .dropTable(TABLE_NAME);
};

