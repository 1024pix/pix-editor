import { userRepository } from '../infrastructure/repositories/index.js';
import JsonapiSerializer from 'jsonapi-serializer';

const { Error: JSONAPIError } = JsonapiSerializer;

export async function checkUserIsAuthenticatedViaBearer(request, h) {
  if (!request.headers.authorization) {
    return _replyWithAuthenticationError(h);
  }
  const apiKey = request.headers.authorization.replace('Bearer ', '');
  try {
    const user = await userRepository.findByApiKey(apiKey);
    return h.authenticated({ credentials: { user } });
  } catch (error) {
    return _replyWithAuthenticationError(h);
  }
}

export async function checkUserIsAuthenticatedViaBasicAndAdmin(username) {
  try {
    const user = await userRepository.findByApiKey(username);
    if (user.access !== 'admin') {
      throw new Error('not an admin');
    }
    return { isValid: true, credentials: { user } };
  } catch (error) {
    return { isValid: false };
  }
}

export async function checkUserHasWriteAccess(request, h) {
  const authenticatedUser = request.auth.credentials.user;
  if (authenticatedUser.access === 'readonly') {
    return _replyForbiddenError(h);
  }
  return h.response(true);
}

async function _replyWithAuthenticationError(h) {
  const errorHttpStatusCode = 401;

  const jsonApiError = new JSONAPIError({
    code: errorHttpStatusCode,
    title: 'Unauthorized access',
    detail: 'Missing or invalid access token in request auhorization headers.'
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}

function _replyForbiddenError(h) {
  const errorHttpStatusCode = 403;

  const jsonApiError = new JSONAPIError({
    code: errorHttpStatusCode,
    title: 'Forbidden access',
    detail: 'Missing or insufficient permissions.',
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}
