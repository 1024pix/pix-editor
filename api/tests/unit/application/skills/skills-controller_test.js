const { expect, hFake } = require('../../../test-helper');

const skillsController = require('../../../../lib/application/skills/skills-controller');

describe('Unit | Controller | skillsController', () => {

  describe('#get', () => {
    it('should return 200', async function() {
      // when
      const response = await skillsController.get();

      // then
      expect(response.status).to.equal(200);
    });
  });
});
