import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { currentURL, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';

module('Acceptance | Missions | Detail', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const notifications = this.owner.lookup('service:notifications');
    notifications.setDefaultClearDuration(50);
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.create('competence', { id: 'recCompetence1.1', pixId: 'pixIdRecCompetence1.1', title: 'Notre compétence' });
    this.server.create('area', { id: 'recArea1', competenceIds: ['recCompetence1.1'] });
    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    this.server.create('framework', { id: 'recFrameworkPix1D', name: 'Pix 1D', areaIds: ['recArea1'] });
    this.server.create('mission-summary', { id: 1, name: 'Mission 1', competence: 'Mirage', createdAt: '2023/12/11', status: 'ACTIVE' });
    this.server.create('mission', { id: 1, name: 'Mission 1', competenceId: 'pixIdRecCompetence1.1', createdAt: '2023/12/11', status: 'ACTIVE', learningObjectives: 'Tout savoir', validatedObjectives: 'Jusque là, rien' });
    this.server.create('mission-summary', { id: 2, name: 'Mission 2', competence: 'Autres', createdAt: '2023/12/11', status: 'INACTIVE' });

    return authenticateSession();
  });

  test('it displays all Pix 1D missions', async function(assert) {
    // when
    const screen = await visit('/missions');
    await click(screen.getAllByRole('row')[1]);

    // then
    assert.strictEqual(currentURL(), '/missions/1');
  });

  test('should display mission details', async function(assert) {
    // when
    const screen = await visit('/missions/1');
    // then
    assert.dom(screen.getByText('Mission 1')).exists();
    assert.dom(screen.getByText('Notre compétence')).exists();
    assert.dom(screen.getByText('Tout savoir')).exists();
    assert.dom(screen.getByText('Jusque là, rien')).exists();
  });

  test('it redirects to missions list', async function(assert) {
    // when
    const screen = await visit('/missions/1');
    await click(screen.getByRole('link', { name: 'Retour à la liste des missions' }));

    // then
    assert.strictEqual(currentURL(), '/missions');
  });
});
