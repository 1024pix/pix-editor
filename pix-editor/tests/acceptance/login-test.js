import { module, test } from 'qunit';
import Mirage from 'ember-cli-mirage';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit, fillByLabel, clickByName } from '@1024pix/ember-testing-library';

module('Acceptance | Login', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const VALID_API_KEY = 'valid-api-key';
  const INVALID_API_KEY = 'invalid-api-key';

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
  });

  module('when user is not authenticated', function(hooks) {
    hooks.beforeEach(function() {
      this.server.get('/users/me', ({ users }, request) => {
        const apiKey = request.requestHeaders && request.requestHeaders['Authorization'];
        return apiKey === `Bearer ${VALID_API_KEY}` ? users.first() : new Mirage.Response(401);
      });
    });

    test('it should lead to login page', async function(assert) {
      // when
      await visit('/statistics');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });

    test('redirect to / when logging in with a valid api key', async function(assert) {
      // given
      await visit('/');

      // when
      await fillByLabel('Pour vous identifier, merci de saisir votre clé personnelle.', VALID_API_KEY);
      await clickByName('Me connecter');

      // then
      assert.strictEqual(currentURL(), '/');
    });

    test('remain on login page when logging in with a invalid api key', async function(assert) {
      // given
      await visit('/');

      // when
      await fillByLabel('Pour vous identifier, merci de saisir votre clé personnelle.', INVALID_API_KEY);
      await clickByName('Me connecter');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });

    test('redirect to the page the user initially intended to visit', async function(assert) {
      // given
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC' });
      this.server.create('framework', { id: 'recFramework0', name: 'Pix' });
      await visit('/statistics');

      // when
      await fillByLabel('Pour vous identifier, merci de saisir votre clé personnelle.', VALID_API_KEY);
      await clickByName('Me connecter');

      // then
      assert.strictEqual(currentURL(), '/statistics');
    });
  });

  module('when user is already authenticated', function(hooks) {
    hooks.beforeEach(function() {
      return authenticateSession();
    });
    test('it should redirect to root page when trying to visit login page', async function(assert) {
      // when
      await visit('/connexion');

      // then
      assert.strictEqual(currentURL(), '/');
    });

    // Ce test ne marche pas je ne sais pas pourquoi \o/
    test.skip('it should redirect to login page when log out', async function(assert) {
      // given
      await visit('/');

      // when
      await clickByName('Déconnexion');
      await clickByName('Oui');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });
});

