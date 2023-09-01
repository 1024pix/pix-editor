import { expect, hFake } from '../../../test-helper.js';

import * as healthcheckController from '../../../../lib/application/healthcheck/healthcheck-controller.js';

describe('Unit | Controller | healthcheckController', () => {

  describe('#get', () => {
    it('should reply with the API description', async function() {
      // when
      const response = await healthcheckController.get(null, hFake);

      // then
      expect(response).to.include.keys('name', 'version', 'description');
      expect(response['name']).to.equal('learning-content-api');
      expect(response['description']).to.equal('API permettant d\'interagir avec le référentiel de contenu Pix');
      expect(response['environment']).to.equal('test');
    });
  });
});
