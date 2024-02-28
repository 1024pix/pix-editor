import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { click, currentURL, triggerEvent } from '@ember/test-helpers';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Static Courses | List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    const tags = [
      this.server.create('static-course-tag', { id: 'tagA', label: 'tagA' }),
      this.server.create('static-course-tag', { id: 'tagB', label: 'tagB' }),
    ];
    this.server.create('static-course-summary', { id: 'courseA', name: 'Premier test statique', isActive: true, challengeCount: 3, createdAt: new Date('2020-01-01'), tags });
    this.server.create('static-course-summary', { id: 'courseB', name: 'Deuxième test statique', isActive: false, challengeCount: 10, createdAt: new Date('2019-01-01'), tags: [] });

    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    return authenticateSession();
  });

  test('should display active static courses by default when accessing list', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Tests statiques');

    // then
    assert.strictEqual(currentURL(), '/static-courses');
    assert.dom(screen.getByText('Premier test statique')).exists();
    assert.dom(screen.queryByText('Deuxième test statique')).doesNotExist();
  });

  test('should display all static courses when accessing list and toggling filter', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Tests statiques');
    await click(await screen.findByRole('button', { name: 'Statut' }));
    await fillByLabel('Nom', 'prem');
    await triggerEvent(await screen.getByLabelText('Nom'), 'keyup', '');
    await click(await screen.findByRole('button', { name: 'Filtrer' }));

    // then
    assert.strictEqual(currentURL(), '/static-courses?name=prem');
    assert.dom(screen.getByText('Premier test statique')).exists();
    assert.dom(screen.queryByText('Deuxième test statique')).doesNotExist();
  });

  test('should render correctly a row', async function(assert) {
    // when
    const screen = await visit('/');
    await clickByName('Tests statiques');
    await click(await screen.findByRole('button', { name: 'Statut' }));
    await fillByLabel('Nom', 'prem');
    await triggerEvent(await screen.getByLabelText('Nom'), 'keyup', '');
    await click(await screen.findByRole('button', { name: 'Filtrer' }));

    // then
    assert.dom(screen.getByText('Premier test statique')).exists();
    assert.dom(screen.getByText('tagA')).exists();
    assert.dom(screen.getByText('3')).exists();
    assert.dom(screen.getByText('01/01/2020')).exists();
    assert.dom(screen.getByText('Actif')).exists();
  });
});
