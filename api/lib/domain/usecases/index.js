const _ = require('lodash');

function _injectDefaults(defaults, targetFn) {
  return (args) => targetFn(Object.assign(Object.create(defaults), args));
}

function _injectDependencies(toBeInjected, dependenciesToInject) {
  return _.mapValues(toBeInjected, _.partial(_injectDefaults, dependenciesToInject));
}

const dependencies = {
  changelogRepository: require('../../infrastructure/repositories/changelog-repository'),
  tubeForEditorRepository: require('../../infrastructure/repositories/tube-for-editor-repository'),
};

module.exports = _injectDependencies(
  {
    validateChallenge: require('./validate-challenge'),
  },
  dependencies
);
