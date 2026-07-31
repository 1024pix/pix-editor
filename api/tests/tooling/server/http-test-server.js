import Hapi from '@hapi/hapi';

import * as security from '../../../lib/infrastructure/security.js';
import { handleFailAction } from '../../../lib/infrastructure/validation.js';

const routesConfig = { routes: { validate: { failAction: handleFailAction } } };

/**
 * ⚠️ You must declare your stubs before calling the HttpTestServer constructor (because of Node.Js memoization).
 *
 * Ex:
 *
 * beforeEach(() => {
 *   sinon.stub(usecases, 'updateOrganizationInformation');
 *   sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, reply) => reply(true));
 *   httpTestServer = new HttpTestServer();
 *   await httpTestServer.register(moduleUnderTest);
 * });
 */
class HttpTestServer {
  constructor() {
    this.hapiServer = Hapi.server(routesConfig);
  }

  register(moduleUnderTest) {
    return this.hapiServer.register(moduleUnderTest);
  }

  inject(method, url, payload, auth, headers) {
    return this.hapiServer.inject({ method, url, payload, auth, headers });
  }

  setupAuthentication() {
    this.hapiServer.scheme('api-token', security.scheme);
    this.hapiServer.strategy('default', 'api-token');
    this.hapiServer.default('default');
  }
}

export { HttpTestServer };
