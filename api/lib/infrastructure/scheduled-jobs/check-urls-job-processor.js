const { validateUrlsFromRelease } = require('../../domain/usecases/validate-urls-from-release');
const releaseRepository = require('../../infrastructure/repositories/release-repository');

module.exports = function() {
  return validateUrlsFromRelease({ releaseRepository });
};
