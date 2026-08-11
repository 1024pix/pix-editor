import { clickByName, clickByText, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

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
    await clickByName('Choisir un référentiel');
    await clickByText('Créer un nouveau référentiel');
    await fillIn(screen.getByRole('textbox', { name: 'Nom :' }), newFrameworkName);
    await click(screen.getByRole('button', { name: 'Enregistrer' }));

    // then
    const frameworks = await store.findAll('framework');
    assert.ok(frameworks.find((framework) => framework.name === newFrameworkName));
    assert.dom(screen.getByText('Référentiel créé')).exists();
    assert.strictEqual(currentURL(), '/');
  });
});
