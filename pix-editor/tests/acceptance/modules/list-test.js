import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';

module('Acceptance | Modules | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    return authenticateSession();
  });

  test('should display modules page when accessing list', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');

    // then
    assert.strictEqual(currentURL(), '/modules');
    assert.dom(await screen.findByRole('heading', { name: 'Modules' })).exists();
  });
});
