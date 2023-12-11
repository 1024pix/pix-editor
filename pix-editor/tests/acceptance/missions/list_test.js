import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL } from '@ember/test-helpers';
import { clickByName, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Missions | List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    this.server.create('framework', { id: 'recFrameworkPix1D', name: 'Pix 1D' });
    this.server.create('mission', { name: 'Mission 1', competence: 'Mirage', createdAt: '2023/12/11', status: 'ACTIVE' });
    this.server.create('mission', { name: 'Mission 2', competence: 'Autres', createdAt: '2023/12/11', status: 'INACTIVE' });

    return authenticateSession();
  });

  test('it displays all Pix 1D missions', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Pix');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Pix 1D' }));
    await clickByName('Missions Pix 1D');

    // then
    assert.strictEqual(currentURL(), '/missions');
    assert.dom(screen.queryByText('Mission 1')).exists();
    assert.dom(screen.queryByText('Mission 2')).exists();
  });

  test('should display only active missions', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Pix');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Pix 1D' }));
    await clickByName('Missions Pix 1D');
    await click(await screen.findByRole('button', { name: 'Statut' }));
    // then
    assert.dom(screen.queryByText('Mission 1')).exists();
    assert.dom(screen.queryByText('Mission 2')).doesNotExist();
  });
});
