const TABLE_NAME = 'difflog';

exports.up = function(knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
    t.text('logtext');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

