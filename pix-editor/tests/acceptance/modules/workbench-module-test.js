import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

module('Acceptance | Modules | Workbench Module', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let id;

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    id = crypto.randomUUID();
    this.server.create('draft-module', { id, internalTitle: 'MON_BEAU_MODULE' });

    return authenticateSession();
  });

  test('displays module details page on click', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');
    await clickByName('Voir le détail');

    // then
    assert.strictEqual(currentURL(), `/modules/workbench/${id}`);
    assert.dom(screen.getByRole('heading', { name: 'Détail du draft de module' })).exists();

    await clickByName('Retour');

    assert.strictEqual(currentURL(), `/modules/workbench`);

    // WORKAROUND: let some time for monaco-editor to dismount
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
});
