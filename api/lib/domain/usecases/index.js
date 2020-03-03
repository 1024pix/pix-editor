const _ = require('lodash');
const injectDefaults = require('../../infrastructure/utils/inject-defaults');

const dependencies = {
  areaRepository: require('../../infrastructure/repositories/area-repository'),
  competenceRepository: require('../../infrastructure/repositories/competence-repository'),
};

function injectDependencies(usecases) {
  return _.mapValues(usecases, _.partial(injectDefaults, dependencies));
}

module.exports = injectDependencies({
  createRelease: require('./create-release'),
});
