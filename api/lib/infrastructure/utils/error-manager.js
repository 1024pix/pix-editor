const DomainErrors = require('../../domain/errors');
const InfraErrors = require('../errors');
const JSONAPI = require('../../interfaces/jsonapi');
const errorSerializer = require('../serializers/jsonapi/error-serializer');

module.exports = { send };

function send(h, error) {
  if (error instanceof DomainErrors.EntityValidationError) {
    return h.response(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
  }

  const infraError = _mapToInfrastructureError(error);

  return h.response(errorSerializer.serialize(infraError)).code(infraError.status);
}

function _mapToInfrastructureError(error) {
  if (error instanceof InfraErrors.InfrastructureError) {
    return error;
  }

  if (error instanceof DomainErrors.ForbiddenAccess) {
    return new InfraErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.UserNotFoundError) {
    return new InfraErrors.NotFoundError(error.message);
  }
  return new InfraErrors.InfrastructureError(error.message);
}
