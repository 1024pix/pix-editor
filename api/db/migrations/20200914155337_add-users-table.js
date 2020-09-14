const TABLE_NAME = 'users';

exports.up = (knex) => {

  function table(t) {

    t.increments().primary();
    t.string('name').notNullable();
    t.string('trigram').notNullable();
    t.uuid('apiKey').notNullable();
    t.enum('access', ['readonly', 'replicator', 'editor', 'admin']).notNullable();
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
