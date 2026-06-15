import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Modules | Production Module', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let id;

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    id = crypto.randomUUID();
    const module = this.server.create('module', { id, internalTitle: 'MON_BEAU_MODULE' });
    this.server.create('draft-module', { id, module, internalTitle: 'MON_BEAU_MODULE' });

    return authenticateSession();
  });

  module('when user clicks on "Voir le détail"', function () {
    test('displays module details page', async function (assert) {
      // when
      await visit('/');
      await clickByName('Modules');
      await clickByName('En production');
      await clickByName('Voir le détail');

      // then
      assert.strictEqual(currentURL(), `/modules/production/${id}`);

      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  module('when user clicks on "Voir le détail du module en prod"', function () {
    test('displays module details page', async function (assert) {
      // when
      await visit('/');
      await clickByName('Modules');
      await clickByName('Voir le détail du module en prod');

      // then
      assert.strictEqual(currentURL(), `/modules/production/${id}`);

      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });
});
