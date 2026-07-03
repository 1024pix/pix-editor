import { challengeRepository, userRepository } from '../infrastructure/repositories/index.js';
import { hasAuthenticatedUserAccess, replyForbiddenError, replyWithAuthenticationError } from './security-utils.js';
import * as config from '../config.js';
import { logger } from '../infrastructure/logger.js';

export async function checkUserIsAuthenticatedViaHeader(request, h) {
  if (!request.headers['x-api-key'] && !request.headers.authorization) {
    return replyWithAuthenticationError(h);
  }
  const apiKey = request.headers['x-api-key'] ?? request.headers.authorization.replace('Bearer ', '');
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
  return hasAuthenticatedUserAccess(request, [
    'replicator',
    'editor',
    'admin',
  ])
    ? h.response(true)
    : replyForbiddenError(h);
}

export function checkUserHasAdminAccess(request, h) {
  return hasAuthenticatedUserAccess(request, ['admin']) ? h.response(true) : replyForbiddenError(h);
}

export function checkUserIsUrlBrokenLinksMonitor(request, h) {
  if (!request.headers['x-api-key']) {
    return replyWithAuthenticationError(h);
  }

  if (!config.urlBrokenLinksMonitor.authSecret) {
    logger.error('Pas de secret');
    return replyWithAuthenticationError(h);
  }

  const apiKey = request.headers['x-api-key'];
  if (config.urlBrokenLinksMonitor.authSecret !== apiKey) {
    return replyWithAuthenticationError(h);
  }

  return h.response(true);
}
