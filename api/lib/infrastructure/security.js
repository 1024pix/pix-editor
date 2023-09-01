import * as securityPreHandlers from '../application/security-pre-handlers.js';

export function scheme() {
  return { authenticate: (request, h) => securityPreHandlers.checkUserIsAuthenticatedViaBearer(request, h) };
}
