import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | Search', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.create('framework', { id: 'recFramework1', name: 'Pix' });
    return authenticateSession();
  });

  test('it should create a new framework', async function(assert) {
    // given
    const newFrameworkName = 'Nouveau titre';

    // when
    await visit('/');
    await click(find('[data-test-frameworks-select] .ember-basic-dropdown-trigger'));
    await click(findAll('.ember-power-select-option')[1]);
    await fillIn('[data-test-framework-name-input] input', newFrameworkName);
    await click(find('[data-test-save-action]'));

    // then
    const frameworks = await store.findAll('framework');
    assert.ok(frameworks.find(framework => framework.name === newFrameworkName));
    assert.dom(find('[data-test-main-message]')).hasText('Référentiel créé');
    assert.strictEqual(currentURL(), '/');
  });

});
