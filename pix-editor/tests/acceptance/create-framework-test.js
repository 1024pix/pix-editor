import { clickByName, clickByText, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, find } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Create-Framework', function (hooks) {
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

  test('it should create a new framework', async function (assert) {
    // given
    const newFrameworkName = 'Nouveau titre';

    // when
    const screen = await visit('/');
    await clickByName('Sélectionner un référentiel');
    await clickByText('Créer un nouveau référentiel');
    await fillIn('[data-test-framework-name-input] input', newFrameworkName);
    await click(find('[data-test-save-action]'));

    // then
    const frameworks = await store.findAll('framework');
    assert.ok(frameworks.find((framework) => framework.name === newFrameworkName));
    assert.dom(screen.getByText('Référentiel créé')).exists();
    assert.strictEqual(currentURL(), '/');
  });
});
