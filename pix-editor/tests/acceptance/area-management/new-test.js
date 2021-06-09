import { module, test } from 'qunit';
import { currentURL, visit, fillIn, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { mockAuthService } from '../../mock-auth';
import sinon from 'sinon';

module('Acceptance | area-management/new', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);
  let apiKey, store, originalWindowConfirm;

  hooks.beforeEach(function() {
    // given
    originalWindowConfirm = window.confirm;
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    apiKey = 'valid-api-key';
    mockAuthService.call(this, apiKey);
    this.server.create('user', { apiKey, trigram: 'ABC' });

    this.server.create('framework', { id: 'recFramework1', name: 'Pix+' });
    this.server.create('framework', { id: 'recFramework0', name: 'Pix' });

  });

  hooks.afterEach(function () {
    window.confirm = originalWindowConfirm;
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

  test('it should prevent transition', async function(assert) {
    // given
    const confirmStub = sinon.stub(window, 'confirm');
    confirmStub.returns(false);

    // when
    await visit('/area-management/new/recFramework1');
    await click(find('.bars.icon'));
    await click(find('[data-test-link-to-event-log]'));

    // then
    assert.equal(currentURL(), '/area-management/new/recFramework1');
  });
});
