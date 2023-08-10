const _ = require('lodash');
const { Error: JSONAPIError } = require('jsonapi-serializer');
const DomainErrors = require('../../domain/errors');
const InfraErrors = require('../errors');
const errorSerializer = require('../serializers/jsonapi/error-serializer');

module.exports = { send };

function send(h, error) {
  if (error instanceof DomainErrors.InvalidStaticCourseCreationOrUpdateError) {
    const jsonApiError = new JSONAPIError(
      error.errors.map((err) => ({
        code: err.code,
        detail: err.data,
        source: {
          pointer: `/data/attributes/${_.kebabCase(err.field)}`,
        },
      }))
    );
    return h.response(jsonApiError).code(422);
  }

  const infraError = _mapToInfrastructureError(error);
  return h.response(errorSerializer.serialize(infraError)).code(infraError.status);
}

function _mapToInfrastructureError(error) {
  if (error instanceof InfraErrors.InfrastructureError) {
    return error;
  }

  if (error instanceof DomainErrors.NotFoundError) {
    return new InfraErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.UserNotFoundError) {
    return new InfraErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.StaticCourseIsInactiveError) {
    return new InfraErrors.ConflictError(error.message);
  }

  return new InfraErrors.InfrastructureError(error.message);
}
