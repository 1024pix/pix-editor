import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Navigate through frameworks', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey, screen;
  hooks.beforeEach(function() {
    this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    return authenticateSession();
  });

  for (const role of ['readonly', 'replicator', 'editor', 'admin']) {
    module(`when user is ${role}`, function(hooks) {
      hooks.beforeEach(async function() {
        //given
        this.server.create('user', { apiKey, trigram: 'ABC', access: role });

        //when
        screen = await visit('/');
      });

      test('it should display select framework', async function(assert) {
        // then
        assert.dom(await screen.findByLabelText('Sélectionner un référentiel')).exists();
      });

      test('it should display generator target profile link', async function(assert) {
        // then
        assert.dom('[data-test-target-profile-link]').exists();
      });

      test('it should display search bar', async function(assert) {
        // then
        assert.dom(await screen.findByLabelText('Rechercher un acquis ou une épreuve...')).exists();
      });
    });
  }

  module('when user is `readpixonly`', function(hooks) {
    hooks.beforeEach(async function() {
      //given
      this.server.create('user', { apiKey, trigram: 'ABC', access: 'readpixonly' });

      // when
      screen = await visit('/');
    });

    test('it should not have access to framework list', async function(assert) {
      // then
      assert.strictEqual(await screen.queryByLabelText('Sélectionner un référentiel'), null);
    });

    test('it should not display generator target profile link', async function(assert) {
      // then
      assert.dom('[data-test-target-profile-link]').doesNotExist();
    });

    test('it should not display search bar', function(assert) {
      // then
      assert.dom('.sidebar-search').doesNotExist();
    });
  });
});
