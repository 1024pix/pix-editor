import { expect, sinon } from '../../../test-helper.js';
import Hapi from '@hapi/hapi';
import * as healthcheckController from '../../../../lib/application/healthcheck/healthcheck-controller.js';
import * as route from '../../../../lib/application/healthcheck/index.js';

describe('Unit | Router | HealthcheckRouter', function() {
  let server;

  beforeEach(function() {
    server = this.server = Hapi.server();
  });

  describe('GET /api', function() {

    beforeEach(function() {
      sinon.stub(healthcheckController, 'get').returns('ok');
      return server.register(route);
    });

    it('should exist', async function() {
      const res = await server.inject({ method: 'GET', url: '/api' });
      expect(res.statusCode).to.equal(200);
    });
  });
});
