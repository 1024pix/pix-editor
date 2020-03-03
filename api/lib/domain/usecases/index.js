const _ = require('lodash');
const injectDefaults = require('../../infrastructure/utils/inject-defaults');

const dependencies = {
  areaDatasource: require('../../infrastructure/datasources/airtable/area-datasource'),
  competenceDatasource: require('../../infrastructure/datasources/airtable/competence-datasource'),
};

function injectDependencies(usecases) {
  return _.mapValues(usecases, _.partial(injectDefaults, dependencies));
}

module.exports = injectDependencies({
  createRelease: require('./create-release'),
});
