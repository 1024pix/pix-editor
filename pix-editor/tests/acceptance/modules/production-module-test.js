import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

module('Acceptance | Modules | Production Module', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let id;

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    id = crypto.randomUUID();
    this.server.create('module', { id, internalTitle: 'MON_BEAU_MODULE' });

    return authenticateSession();
  });

  test('displays module details page on click', async function (assert) {
    // when
    await visit('/');
    await clickByName('Modules');
    await clickByName('En production');
    await clickByName('Voir le détail');

    // then
    assert.strictEqual(currentURL(), `/modules/production/${id}`);

    await clickByName('Retour');

    assert.strictEqual(currentURL(), `/modules/production`);

    // WORKAROUND: let some time for monaco-editor to dismount
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
});
