import * as securityPreHandlers from '../application/security-pre-handlers.js';

export const schemes = {
  apiToken() {
    return { authenticate: (request, h) => securityPreHandlers.checkUserIsAuthenticatedViaBearer(request, h) };
  },
  jwtToken() {
    return {
      authenticate: (request, h) => {
        return securityPreHandlers.checkAppIsAuthenticatedViaJWT(request, h);
      },
    };
  },
};
