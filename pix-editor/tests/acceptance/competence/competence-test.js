import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { mockAuthService } from '../../mock-auth';

module('Acceptance | competence | competence', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    mockAuthService.call(this, undefined);
  });

  module('when unlogged', function() {
    test('it should show loggin popin', async function(assert) {
      // when
      await visit('/competence/recCompetence1');

      // then
      assert.dom('#login-api-key').exists();
    });
  });
});
