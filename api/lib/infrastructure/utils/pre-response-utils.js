const errorManager = require('./error-manager');
const { DomainError } = require('../../domain/errors');
const { InfrastructureError } = require('../errors');

function catchDomainAndInfrastructureErrors(request, h) {
  const response = request.response;

  if (response instanceof DomainError || response instanceof InfrastructureError) {
    return errorManager.send(h, response);
  }
  if (response.isBoom) {
    if (response.output.statusCode === 404 &&
        request.method === 'get' &&
        !request.path.startsWith('/api')) {
      return h.file('public/pix-editor/index.html').code(200);
    }
  }

  return h.continue;
}

module.exports = {
  catchDomainAndInfrastructureErrors,
};
