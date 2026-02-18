import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Admin | Navigation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey, screen;

  hooks.beforeEach(function () {
    this.owner.lookup('service:store');
    this.server.create('config', 'default');
  });

  for (const role of ['readpixonly', 'readonly', 'replicator', 'editor']) {
    module(`when user is ${role}`, function (hooks) {
      hooks.beforeEach(async function () {
        this.server.create('user', { apiKey, trigram: 'ABC', access: role });
        screen = await visit('/administration');
        return authenticateSession();
      });

      test('it should redirect to home page', async function (assert) {
        // then
        assert.strictEqual(currentURL(), '/');
      });
    });
  }

  module('when there is no user', function () {
    test('it should redirect to login page', async function (assert) {
      // given
      this.server.get('/users/me', () => {
        return new Response(401);
      });

      screen = await visit('/administration');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when user is `admin`', function (hooks) {
    hooks.beforeEach(async function () {
      this.server.create('user', { apiKey, trigram: 'ABC', access: 'admin' });
      screen = await visit('/');
      return authenticateSession();
    });

    test('it should navigate to admin dashboard', async function (assert) {
      // given
      this.server.create('admin-schema', { label: 'Utilisateurs', entityName: 'users' });

      // when
      await click(await screen.findByRole('link', { name: 'Administration' }));

      // then
      assert.strictEqual(currentURL(), '/administration');
      assert.dom(await screen.findByRole('link', { name: 'Retourner sur Pix Editor' }));
      assert.dom(await screen.findByRole('link', { name: 'Utilisateurs' }));
    });

    test('it should navigate to admin entity list', async function (assert) {
      // given
      this.server.create('admin-schema', {
        label: 'Utilisateurs',
        entityName: 'users',
        fields: [
          { key: 'name', label: 'Nom', type: 'string' },
          { key: 'patate', label: 'Chocolat', type: 'string' },
        ],
      });
      this.server.create('admin-entity', { properties: { name: 'Dinguou', patate: '123' } });

      // when
      await click(await screen.findByRole('link', { name: 'Administration' }));
      await click(await screen.findByRole('link', { name: 'Utilisateurs' }));

      // then
      assert.strictEqual(currentURL(), '/administration/users/list');

      assert.dom(await screen.findByRole('columnheader', { name: 'Nom' }));
      assert.dom(await screen.findByRole('columnheader', { name: 'Chocolat' }));

      assert.dom(await screen.findByRole('cell', { name: 'Dinguou' }));
      assert.dom(await screen.findByRole('cell', { name: '123' }));
    });

    module('when entity is not creatable', function () {
      test('should not display a create button', async function (assert) {
        // given
        this.server.create('admin-schema', {
          label: 'Fraises',
          entityName: 'strawberries',
          creatable: false,
          fields: [{ key: 'name', label: 'Nom', type: 'string' }],
        });
        const screen = await visit('/administration/strawberries/list');

        // then
        assert.notOk(await screen.queryByRole('link', { name: 'Créer' }), 'Create button is not visible');
      });
    });
  });
});
