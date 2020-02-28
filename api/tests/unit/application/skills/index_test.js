const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const skillsController = require('../../../../lib/application/skills/skills-controller');
const route = require('../../../../lib/application/skills');

describe('Unit | Router | SkillsRouter', function() {
  let server;

  beforeEach(function() {
    server = this.server = Hapi.server();
  });

  describe('GET /api/skills', function() {

    beforeEach(function() {
      sinon.stub(skillsController, 'get').returns('ok');
      return server.register(route);
    });

    it('should exist', async function() {
      const res = await server.inject({ method: 'GET', url: '/api/skills' });
      expect(res.statusCode).to.equal(200);
    });
  });
});
