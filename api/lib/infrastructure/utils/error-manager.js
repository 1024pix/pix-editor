import _ from 'lodash';
import JsonapiSerializer from 'jsonapi-serializer';
import * as DomainErrors from '../../domain/errors.js';
import * as InfraErrors from '../errors.js';
import { errorSerializer } from '../serializers/jsonapi/index.js';

const { Error: JSONAPIError } = JsonapiSerializer;

export function send(h, error) {
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
