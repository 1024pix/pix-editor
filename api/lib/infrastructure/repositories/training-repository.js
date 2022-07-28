const { knex } = require('../../../db/knex-database-connection');
const Training = require('../../domain/models/Training');

async function list() {
  const trainings = await knex('trainings').orderBy('id', 'asc');

  return trainings.map(_toDomain);
}

function _toDomain(training) {
  return new Training(training);
}

module.exports = {
  list,
};
