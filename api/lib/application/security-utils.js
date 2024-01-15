import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

export function hasAuthenticatedUserAccess(request, access) {
  const authenticatedUser = request.auth.credentials.user;
  return authenticatedUser.access === access;
}

export function replyWithAuthenticationError(h) {
  const errorHttpStatusCode = 401;

  const jsonApiError = new JSONAPIError({
    code: errorHttpStatusCode,
    title: 'Unauthorized access',
    detail: 'Missing or invalid access token in request auhorization headers.'
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}

export function replyForbiddenError(h) {
  const errorHttpStatusCode = 403;

  const jsonApiError = new JSONAPIError({
    code: errorHttpStatusCode,
    title: 'Forbidden access',
    detail: 'Missing or insufficient permissions.',
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}
