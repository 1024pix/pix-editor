import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

module('Acceptance | Missions | List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    this.server.create('framework', { id: 'recFrameworkPix1D', name: 'Pix 1D' });
    this.server.create('mission-summary', { name: 'Mission 1', competence: 'Mirage', createdAt: '2023/12/11', status: 'VALIDATED' });
    this.server.create('mission-summary', { name: 'Mission 2', competence: 'Autres', createdAt: '2023/12/11', status: 'INACTIVE' });
    this.server.create('mission-summary', { name: 'Mission 3', competence: 'Autres', createdAt: '2023/11/11', status: 'EXPERIMENTAL' });

    return authenticateSession();
  });

  test('it displays all Pix 1D missions', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Sélectionner un référentiel');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Pix 1D' }));
    await clickByName('Missions Pix 1D');

    // then
    assert.strictEqual(currentURL(), '/missions');
    assert.dom(screen.queryByText('Mission 1')).exists();
    assert.dom(screen.queryByText('Mission 2')).exists();
  });

  test('should display only validated missions', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Sélectionner un référentiel');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Pix 1D' }));
    await clickByName('Missions Pix 1D');
    await click(screen.getByLabelText('Statut'));
    await click(await screen.findByRole('checkbox', { name: 'Validée' }));

    // then
    assert.dom(screen.queryByText('Mission 1')).exists();
    assert.dom(screen.queryByText('Mission 2')).doesNotExist();
  });

  test('should display only mission validée et expérimental', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Sélectionner un référentiel');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Pix 1D' }));
    await clickByName('Missions Pix 1D');
    await click(screen.getByLabelText('Statut'));
    await click(await screen.findByRole('checkbox', { name: 'Validée' }));
    await click(await screen.findByRole('checkbox', { name: 'Expérimentale' }));

    // then
    assert.dom(screen.queryByText('Mission 1')).exists();
    assert.dom(screen.queryByText('Mission 3')).exists();
    assert.dom(screen.queryByText('Mission 2')).doesNotExist();
  });

});
