const packageJSON = require('../../../package.json');
const settings = require('../../config');

module.exports = {

  get() {
    return {
      'name': packageJSON.name,
      'version': packageJSON.version,
      'description': packageJSON.description,
      'environment': settings.environment,
      'container-version': process.env.CONTAINER_VERSION,
      'container-app-name': process.env.APP,
    };
  },
};
