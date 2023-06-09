import { module, test } from 'qunit';
import { currentURL, visit, fillIn, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | area-management/new', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store;

  hooks.beforeEach(function() {
    // given
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('framework', { id: 'recFramework1', name: 'Pix+' });
    this.server.create('framework', { id: 'recFramework0', name: 'Pix' });

    return authenticateSession();
  });

  test('it should create a new area', async function(assert) {
    // given
    const newAreaTitle = 'Nouveau titre';

    // when
    await visit('/');
    await click(findAll('.ember-basic-dropdown-trigger')[1]);
    await click(find('.ember-power-select-option'));
    await click(find('[data-test-add-area]'));
    await fillIn('[data-test-area-title-input] input', newAreaTitle);
    await click(find('[data-test-save-button]'));

    // then
    const framework = await store.peekRecord('framework', 'recFramework1');
    assert.ok(framework.areas.find(area => area.titleFrFr === newAreaTitle));
    assert.dom(find('[data-test-main-message]')).hasText('Domaine créé');
    assert.equal(currentURL(), '/');
  });

  test('it should cancel creation', async function(assert) {

    // when
    await visit('/area-management/new/recFramework1');
    await click(find('[data-test-cancel-button]'));

    // then
    assert.dom('[data-test-main-message]').hasText('Création du domaine annulé');
    assert.equal(currentURL(), '/');
  });
});
