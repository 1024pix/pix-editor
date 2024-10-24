const TABLE_NAME = 'whitelisted_urls';

export function up(knex) {
  function table(t) {
    t.increments('id').primary();
    t.bigInteger('createdBy').references('users.id');
    t.bigInteger('latestUpdatedBy').references('users.id');
    t.bigInteger('deletedBy').references('users.id');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('deletedAt').defaultTo(null);
    t.text('url').notNullable();
    t.string('checkType').notNullable();
    t.string('relatedEntityIds');
    t.text('comment');
  }

  return knex.schema
    .createTable(TABLE_NAME, table);
}

export function down(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
}
