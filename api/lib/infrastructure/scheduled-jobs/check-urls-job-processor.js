const { validateUrlsFromRelease } = require('../../domain/usecases/validate-urls-from-release');

module.exports = function() {
  return validateUrlsFromRelease();
};
