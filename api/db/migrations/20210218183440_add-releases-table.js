const TABLE_NAME = 'releases';

exports.up = (knex) => {

  function table(t) {
    t.increments().primary();
    t.json('content').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table);
};

exports.down = (knex) => {

  return knex.schema
    .dropTable(TABLE_NAME);
};

