import { userRepository } from '../infrastructure/repositories/index.js';
import { hasAuthenticatedUserAccess, replyForbiddenError, replyWithAuthenticationError } from './security-utils.js';

export async function checkUserIsAuthenticatedViaBearer(request, h) {
  if (!request.headers.authorization) {
    return replyWithAuthenticationError(h);
  }
  const apiKey = request.headers.authorization.replace('Bearer ', '');
  try {
    const user = await userRepository.findByApiKey(apiKey);
    return h.authenticated({ credentials: { user } });
  } catch {
    return replyWithAuthenticationError(h);
  }
}

export async function checkUserIsAuthenticatedViaBasicAndAdmin(username) {
  try {
    const user = await userRepository.findByApiKey(username);
    if (user.access !== 'admin') {
      throw new Error('not an admin');
    }
    return { email: username };
  } catch {
    return false;
  }
}

export function checkUserHasWriteAccess(request, h) {
  return hasAuthenticatedUserAccess(request, ['replicator', 'editor', 'admin']) ? h.response(true) : replyForbiddenError(h);
}

export function checkUserHasAdminAccess(request, h) {
  return hasAuthenticatedUserAccess(request, ['admin']) ? h.response(true) : replyForbiddenError(h);
}
