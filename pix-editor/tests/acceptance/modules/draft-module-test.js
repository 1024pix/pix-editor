import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Modules | Draft Module', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let id;

  module('when user is allowed to modify draft modules', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'admin' });
      id = crypto.randomUUID();
      this.server.create('draft-module', {
        id,
        internalTitle: 'MON_BEAU_MODULE',
        updatedAt: '2026-08-14T08:54:10.449Z',
      });

      return authenticateSession();
    });

    test('displays a breadcrumb', async function (assert) {
      // when
      const screen = await visit('/');
      await clickByName('Modules');
      await clickByName('Voir le détail');

      // then
      const breadcrumb = screen.getByRole('navigation');
      assert.dom(within(breadcrumb).getByRole('link', { name: 'Liste des brouillons' })).exists();
      assert.dom(within(breadcrumb).getByText('Détail du brouillon')).exists();

      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    test('displays module details page on click', async function (assert) {
      // when
      const screen = await visit('/');
      await clickByName('Modules');
      await clickByName('Voir le détail');

      // then
      assert.strictEqual(currentURL(), `/modules/workbench/${id}`);
      assert.dom(screen.getByRole('heading', { name: 'MON_BEAU_MODULE' })).exists();
      assert.dom(screen.getByText('● brouillon')).exists();
      assert.dom(screen.getByText('Dernière modification le 14/08/2026')).exists();

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
        assert.dom(screen.getByRole('heading', { name: 'MON_BEAU_MODULE' })).exists();
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

        await click(
          screen.getByRole('button', {
            name: 'Publier le brouillon "MON_BEAU_MODULE"',
          }),
        );
        const dialog = await screen.findByRole('dialog', {
          name: 'Confirmation de publication',
        });

        // when
        await click(
          within(dialog).getByRole('button', {
            name: 'Confirmer la publication',
          }),
        );

        // then
        assert.dom(await screen.findByText('Le module "MON_BEAU_MODULE" a été publié.')).exists();
        assert.strictEqual(currentURL(), `/modules/production/${id}`);

        // WORKAROUND: let some time for monaco-editor to settle
        await new Promise((resolve) => setTimeout(resolve, 100));
      });
    });

    module('when a module has errors', function () {
      test('it should display all the validation errors', async function (assert) {
        // given
        const moduleWithErrors = this.server.create('draft-module', {
          id: crypto.randomUUID(),
          internalTitle: 'MODULE_DRAFT',
          validationErrors: [
            { message: '"ariaLabel" ne doit pas être vide', isSchemaError: true },
            { message: "Problème de duplications d'Ids", isSchemaError: false },
          ],
          hasBeenValidated: false,
        });

        // when
        const screen = await visit(`/modules/workbench/${moduleWithErrors.id}`);
        // WORKAROUND: let some time for monaco-editor to settle
        await new Promise((resolve) => setTimeout(resolve, 100));

        // then
        assert.dom(screen.getByText('2 erreurs de validation')).exists();
        assert.dom(screen.getByText("Problème de duplications d'Ids")).exists();
        assert.dom(screen.getByText('"ariaLabel" ne doit pas être vide')).exists();
      });

      test('it should not display publish button', async function (assert) {
        // given
        const moduleWithErrors = this.server.create('draft-module', {
          id: crypto.randomUUID(),
          internalTitle: 'MODULE_DRAFT',
          validationErrors: [{ message: 'oups !', isSchemaError: false }],
          hasBeenValidated: false,
        });

        // when
        const screen = await visit(`/modules/workbench/${moduleWithErrors.id}`);
        // WORKAROUND: let some time for monaco-editor to settle
        await new Promise((resolve) => setTimeout(resolve, 100));

        // then
        assert.dom(screen.queryByRole('button', { name: 'Publier' })).doesNotExist();
      });
    });

    module('when a module has no errors', function () {
      test('it should not display errors', async function (assert) {
        // given
        const screen = await visit(`/modules/workbench/${id}`);
        // WORKAROUND: let some time for monaco-editor to settle
        await new Promise((resolve) => setTimeout(resolve, 100));

        // then
        assert
          .dom(
            screen.queryByRole('button', {
              name: '1 erreur de validation La publication est impossible tant que des erreurs subsistent.',
            }),
          )
          .doesNotExist();
      });

      test('it should display a publish button', async function (assert) {
        // given
        // when
        const screen = await visit(`/modules/workbench/${id}`);
        // WORKAROUND: let some time for monaco-editor to settle
        await new Promise((resolve) => setTimeout(resolve, 100));

        // then
        assert.dom(screen.getByRole('button', { name: 'Publier le brouillon "MON_BEAU_MODULE"' })).exists();
      });
    });
  });

  module('when user is not allowed to modify draft modules', function () {
    test('it should not display the modify draft module button', async function (assert) {
      // given
      this.server.create('config', 'default');
      this.server.create('user', { trigram: 'ABC', access: 'readonly' });
      id = crypto.randomUUID();
      this.server.create('draft-module', {
        id,
        internalTitle: 'MON_BEAU_MODULE',
        updatedAt: '2026-08-14T08:54:10.449Z',
      });
      await authenticateSession();

      // when
      const screen = await visit(`/modules/workbench/${id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert.dom(screen.queryByRole('link', { name: 'Modifier' })).doesNotExist();
    });

    module('when a module has no errors', function () {
      test('it should not display a publish button', async function (assert) {
        // given
        this.server.create('config', 'default');
        this.server.create('user', { trigram: 'ABC', access: 'readonly' });
        id = crypto.randomUUID();
        this.server.create('draft-module', {
          id,
          internalTitle: 'MON_BEAU_MODULE',
          updatedAt: '2026-08-14T08:54:10.449Z',
        });
        await authenticateSession();

        // when
        const screen = await visit(`/modules/workbench/${id}`);
        // WORKAROUND: let some time for monaco-editor to settle
        await new Promise((resolve) => setTimeout(resolve, 100));

        // then
        assert.dom(screen.queryByRole('button', { name: 'Publier le brouillon "MON_BEAU_MODULE"' })).doesNotExist();
      });
    });
  });
});
