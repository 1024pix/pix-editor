import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL, find, triggerEvent } from '@ember/test-helpers';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Missions | Creation', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const notifications = this.owner.lookup('service:notifications');
    notifications.setDefaultClearDuration(50);
    this.server.create('config', 'default');
    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    this.server.create('framework', { id: 'recFrameworkPix1D', name: 'Pix 1D' });
    this.server.create('mission-summary', { name: 'Mission 1', competence: 'Mirage', createdAt: '2023/12/11', status: 'ACTIVE' });
    this.server.create('mission-summary', { name: 'Mission 2', competence: 'Autres', createdAt: '2023/12/11', status: 'INACTIVE' });
  });

  module.skip('when user does not have write access', function(hooks) {

    hooks.beforeEach(function() {
      this.server.create('user', { trigram: 'ABC', access: 'readonly' });
      return authenticateSession();
    });

    test('should prevent user from being able to access creation form', async function(assert) {
      // when
      const screen = await visit('/');
      await clickByName('Pix');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Pix 1D' }));
      await clickByName('Missions Pix 1D');

      // then
      assert.dom(screen.queryByText('Créer une nouvelle mission')).doesNotExist();

    });
  });

  module('when user has write access', function(hooks) {

    hooks.beforeEach(function() {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'admin' });
      return authenticateSession();
    });

    test('should be able to access mission creation', async function(assert) {
      // given
      const screen = await visit('/');
      await clickByName('Pix');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Pix 1D' }));
      await clickByName('Missions Pix 1D');

      // when
      await clickByName('Créer une nouvelle mission');

      // then
      assert.strictEqual(currentURL(), '/missions/new');
    });

    test('should be able to create a mission', async function(assert) {
      // given
      const screen = await visit('/missions/new');

      // when
      await fillByLabel('* Nom de la mission', 'Nouvelle mission de test');
      await triggerEvent(find('#mission-name'), 'keyup', '');
      await clickByName('Créer la mission');

      // then
      assert.strictEqual(currentURL(), '/missions');
      assert.dom(screen.queryByText('Nouvelle mission de test')).exists();
    });

    test('should be able to cancel a mission creation', async function(assert) {
      // given
      const screen = await visit('/missions/new');

      // when
      await fillByLabel('* Nom de la mission', 'Nouvelle mission de test');
      await triggerEvent(find('#mission-name'), 'keyup', '');
      await clickByName('Annuler');

      // then
      assert.strictEqual(currentURL(), '/missions');
      assert.dom(screen.queryByText('Nouvelle mission de test')).doesNotExist();
    });
  });
});
