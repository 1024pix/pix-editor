import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Modules | New', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    this.server.createList('module-summary', 2);

    return authenticateSession();
  });

  test('displays module creation page', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');
    await screen.getByRole('link', { name: 'Créer un module' }).click();

    // then
    assert.strictEqual(currentURL(), '/modules/new');
    assert.dom(await screen.findByRole('heading', { name: "Création d'un module" })).exists();
  });
});
