import { module, test } from 'qunit';
import Mirage from 'ember-cli-mirage';
import {visit, fillIn, click, currentURL} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Login', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const VALID_API_KEY = 'valid-api-key';
  const INVALID_API_KEY = 'invalid-api-key';

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.get('/users/me', ({ users }, request) => {
      const apiKey = request.requestHeaders && request.requestHeaders['Authorization'];
      return apiKey === `Bearer ${VALID_API_KEY}` ? users.first() : new Mirage.Response(401);;
    });
  });

  module('when user is not authenticated', function() {
    test('it should lead to login page', async function(assert) {
      // when
      await visit('/statistics');

      // then
      assert.strictEqual(currentURL(), `/connexion`);
    });

    test('redirect to / when logging in with a valid api key', async function(assert) {
      // given
      await visit('/');
      await fillIn('#login-api-key', VALID_API_KEY);

      // when
      await click('[data-test-login-button]');

      // then
      assert.strictEqual(currentURL(), `/`);
    });

    test('remain on login page when logging in with a invalid api key', async function(assert) {
      // given
      await visit('/');
      await fillIn('#login-api-key', INVALID_API_KEY);

      // when
      await click('[data-test-login-button]');

      // then
      assert.strictEqual(currentURL(), `/connexion`);
    });

    test('redirect to the page the user initially intended to visit', async function(assert) {
      // given
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC' });
      this.server.create('framework', { id: 'recFramework0', name: 'Pix' });
      await visit('/statistics');
      await fillIn('#login-api-key', VALID_API_KEY);

      // when
      await click('[data-test-login-button]');

      // then
      assert.strictEqual(currentURL(), `/statistics`);
    });
  });
});

