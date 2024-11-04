import * as DomainErrors from '../../domain/errors.js';
import * as InfraErrors from '../errors.js';
import { errorSerializer } from '../serializers/jsonapi/index.js';

export function send(h, error) {
  const { infraErrors, statusCode } = _mapToInfrastructureError(error);

  return h.response(errorSerializer.serialize(infraErrors)).code(statusCode);
}

function _mapToInfrastructureError(error) {
  if (error instanceof InfraErrors.InfrastructureError) {
    return {
      infraErrors: [error],
      statusCode: error.status,
    };
  }
  if (error instanceof DomainErrors.NotFoundError) {
    const infraError = new InfraErrors.NotFoundError(error.message);
    return {
      infraErrors: [infraError],
      statusCode: infraError.status,
    };
  }
  if (error instanceof DomainErrors.UserNotFoundError) {
    const infraError = new InfraErrors.NotFoundError(error.message);
    return {
      infraErrors: [infraError],
      statusCode: infraError.status,
    };
  }
  if (error instanceof DomainErrors.StaticCourseIsInactiveError) {
    const infraError = new InfraErrors.ConflictError(error.message);
    return {
      infraErrors: [infraError],
      statusCode: infraError.status,
    };
  }
  if (error instanceof DomainErrors.ForbiddenError) {
    const infraError = new InfraErrors.ForbiddenError(error.message);
    return {
      infraErrors: [infraError],
      statusCode: infraError.status,
    };
  }
  if (error instanceof DomainErrors.InvalidStaticCourseCreationOrUpdateError) {
    const infraErrors = error.errors.map((error) => new InfraErrors.UnprocessableEntityError({ detail: error.detail, attribute: error.attribute }));
    return {
      infraErrors,
      statusCode: 422,
    };
  }

  const infraError = new InfraErrors.InfrastructureError(error.message);
  return {
    infraErrors: [infraError],
    statusCode: infraError.status,
  };
}
