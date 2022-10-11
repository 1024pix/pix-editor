const TABLE_NAME = 'trainings';
exports.up = function(knex) {
  return knex.schema
    .dropTable(TABLE_NAME);
};

exports.down = function() {

};
