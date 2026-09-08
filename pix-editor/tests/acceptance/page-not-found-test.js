import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Page not found', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
  });

  module('when user is not authenticated', function () {
    test('should redirect to home page', async function (assert) {
      // when
      await visit('/patate');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when user is already authenticated', function () {
    test('it should redirect to root page', async function (assert) {
      authenticateSession();
      // when
      await visit('/patate');

      // then
      assert.strictEqual(currentURL(), '/');
    });
  });
});
