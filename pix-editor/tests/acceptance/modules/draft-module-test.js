import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Modules | Draft Module', function (hooks) {
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

    // WORKAROUND: let some time for monaco-editor to settle
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  module('when user clicks on "Modifier"', function () {
    test('displays draft module edition page', async function (assert) {
      // when
      const screen = await visit(`/modules/workbench/${id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
      await clickByName('Modifier');

      // then
      assert.strictEqual(currentURL(), `/modules/workbench/${id}/edit`);
      assert.dom(screen.getByRole('heading', { name: 'Édition du draft de module' })).exists();
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // when
      await clickByName('Enregistrer');

      // then
      assert.strictEqual(currentURL(), `/modules/workbench/${id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  module('when user clicks "Publier"', function () {
    test('publishes module and navigates to module’s details page', async function (assert) {
      // given
      const screen = await visit(`/modules/workbench/${id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // when
      await click(screen.getByRole('button', { name: 'Publier le module "MON_BEAU_MODULE"' }));

      // then
      assert.dom(await screen.findByText('Le module "MON_BEAU_MODULE" a été publié.')).exists();
      assert.strictEqual(currentURL(), `/modules/production/${id}`);

      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  module('when a module has errors', function () {
    test('it should display errors', async function (assert) {
      // given
      const moduleWithErrors = this.server.create('draft-module', {
        id: crypto.randomUUID(),
        internalTitle: 'MODULE_DRAFT',
        validationErrors: ['oups !'],
      });

      // when
      const screen = await visit(`/modules/workbench/${moduleWithErrors.id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert.dom(screen.getByRole('button', { name: 'Erreurs de validation 1 erreur' })).exists();
    });
  });

  module('when a module has no errors', function () {
    test('it should not display errors', async function (assert) {
      // given
      const screen = await visit(`/modules/workbench/${id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert.dom(screen.queryByRole('button', { name: 'Erreurs de validation 1 erreur' })).doesNotExist();
    });
  });
});
