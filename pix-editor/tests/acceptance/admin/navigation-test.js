import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../setup-application-rendering';

module('Acceptance | Admin | Navigation', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey, screen;

  hooks.beforeEach(function() {
    this.owner.lookup('service:store');
    this.server.create('config', 'default');
  });

  for (const role of [ 'readpixonly', 'readonly', 'replicator', 'editor']) {
    module(`when user is ${role}`, function(hooks) {
      hooks.beforeEach(async function() {
        this.server.create('user', { apiKey, trigram: 'ABC', access: role });
        screen = await visit('/administration');
        return authenticateSession();
      });

      test('it should redirect to home page', async function(assert) {
        // then
        assert.strictEqual(currentURL(), '/');
      });
    });
  }

  module('when there is no user', function() {
    test('it should redirect to login page', async function(assert) {
      // given
      this.server.get('/users/me', () => {
        return new Response(401);
      });

      screen = await visit('/administration');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when user is `admin`', function(hooks) {
    hooks.beforeEach(async function() {
      this.server.create('user', { apiKey, trigram: 'ABC', access: 'admin' });
      screen = await visit('/');
      return authenticateSession();
    });

    test('it should navigate to admin dashboard', async function(assert) {
      // given
      this.server.create('admin-schema', { label: 'Utilisateurs' });

      // when
      await click(await screen.findByRole('link', { name: 'Administration' }));

      // then
      assert.strictEqual(currentURL(), '/administration');
      assert.dom(await screen.findByRole('link', { name: 'Retourner sur Pix Editor' }));
      assert.dom(await screen.findByRole('link', { name: 'Utilisateurs' }));
    });
  });
});
