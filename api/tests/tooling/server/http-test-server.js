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
  constructor({ mustThrowOn5XXError = true } = {}) {
    this.hapiServer = Hapi.server(routesConfig);
    this._mustThrow5XXOnError = mustThrowOn5XXError;
  }

  async register(moduleUnderTest) {
    await this.hapiServer.register(moduleUnderTest);
  }

  async request(method, url, payload, auth, headers) {
    const result = await this.hapiServer.inject({ method, url, payload, auth, headers });

    if (this._mustThrowOn5XXError && result.statusCode >= 500) {
      throw new Error('Request Failed');
    }

    return result;
  }

  requestObject({ method, url, payload, auth, headers }) {
    return this.request(method, url, payload, auth, headers);
  }

  setupAuthentication() {
    this.hapiServer.scheme('api-token', security.scheme);
    this.hapiServer.strategy('default', 'api-token');
    this.hapiServer.default('default');
  }

  setupDeserialization() {
    this.hapiServer.ext('onPreHandler', async (request, h) => {
      if (request.payload?.data) {
        request.deserializedPayload = await deserializer.deserialize(request.payload);
      }
      return h.continue;
    });
  }
}

export { HttpTestServer };
