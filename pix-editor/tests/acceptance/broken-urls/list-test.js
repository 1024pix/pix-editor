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
      errorMessage: 'Not found',
      statusCode: 404,
    });
    this.server.create('broken-url', {
      id: 2,
      url: 'http://chocolat-fromage.org',
      errorMessage: 'Non',
      statusCode: 406,
    });

    return authenticateSession();
  });

  test('should display broken urls when accessing list', async function (assert) {
    // when
    const screen = await visit('/broken-urls');

    // then
    assert.dom(screen.getByRole('heading', { name: 'Liste des URLs cassées' })).exists();
    assert.strictEqual(screen.getAllByRole('row').length, 3);
    assert.dom(screen.getByText('http://pipeau-la-grenouille.fr')).exists();
    assert.dom(screen.getByText('http://chocolat-fromage.org')).exists();
  });
});
