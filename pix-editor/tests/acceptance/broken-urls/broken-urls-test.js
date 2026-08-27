import { visit } from '@1024pix/ember-testing-library';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Broken URLs | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    this.server.create('broken-url', {
      id: 1,
      url: 'http://pipeau-la-grenouille.fr',
      errorMessage: null,
      statusCode: 404,
    });

    return authenticateSession();
  });

  test('should display broken urls when accessing list', async function (assert) {
    // when
    const screen = await visit('/broken-urls');

    // then
    assert.dom(screen.getByText('Liste des URL cassées')).exists();
  });
});
