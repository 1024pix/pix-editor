import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'pix-editor/tests/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../setup-application-rendering';

module('Acceptance | Synchronize Translations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });
    return authenticateSession();
  });

  test('should display page to synchronize translations', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Récupérer les traductions');

    // then
    assert.strictEqual(currentURL(), '/synchronize-translations');
    await click(screen.getByRole('button', { name: 'Récupérer les traductions depuis Phrase' }));
    assert.dom(await screen.findByText('Téléchargement des traductions depuis Phrase effectué.')).exists();
  });
});
