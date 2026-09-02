import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
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
    await clickByName(t('modules.components.modules-list.detail'));

    // then
    const breadcrumb = screen.getByRole('navigation');
    assert.dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.workbench.label') })).exists();
    assert.dom(within(breadcrumb).getByText(t('modules.breadcrumb.draft-module.label'))).exists();

    // WORKAROUND: let some time for monaco-editor to settle
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  test('displays module details page on click', async function (assert) {
    // when
    const screen = await visit('/');
    await clickByName('Modules');
    await clickByName(t('modules.components.modules-list.detail'));

    // then
    assert.strictEqual(currentURL(), `/modules/workbench/${id}`);
    assert.dom(screen.getByRole('heading', { name: 'MON_BEAU_MODULE' })).exists();
    assert.dom(screen.getByText(`● ${t('modules.draft-module.information-tag')}`)).exists();
    assert.dom(screen.getByText(t('modules.draft-module.last-modified-at', { modifiedDate: '14/08/2026' }))).exists();

    // WORKAROUND: let some time for monaco-editor to settle
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  module('when user clicks on "Modifier"', function () {
    test('displays draft module edition page', async function (assert) {
      // when
      const screen = await visit(`/modules/workbench/${id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
      await clickByName(t('modules.draft-module.edit'));

      // then
      assert.strictEqual(currentURL(), `/modules/workbench/${id}/edit`);
      assert.dom(screen.getByRole('heading', { name: 'MON_BEAU_MODULE' })).exists();
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // when
      await clickByName(t('modules.components.module-form.save'));

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
          name: t('modules.components.publish-module-button.aria-label', { title: 'MON_BEAU_MODULE' }),
        }),
      );
      const dialog = await screen.findByRole('dialog', {
        name: t('modules.components.publish-module-button.confirmation-dialog.title'),
      });

      // when
      await click(
        within(dialog).getByRole('button', {
          name: t('modules.components.publish-module-button.confirmation-dialog.confirm'),
        }),
      );

      // then
      assert
        .dom(
          await screen.findByText(t('modules.components.publish-module-button.success', { title: 'MON_BEAU_MODULE' })),
        )
        .exists();
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
        validationErrors: [{ message: 'oups !', isSchemaError: false }],
      });

      // when
      const screen = await visit(`/modules/workbench/${moduleWithErrors.id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `${t('modules.components.validation-errors.title', { count: 1 })} ${t('modules.components.validation-errors.information')} ${t('modules.components.validation-errors.expand', { count: 1 })}`,
          }),
        )
        .exists();
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
      assert
        .dom(screen.queryByRole('button', { name: t('modules.components.publish-module-button.publish') }))
        .doesNotExist();
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
            name: `${t('modules.components.validation-errors.title', { count: 1 })} ${t('modules.components.validation-errors.information')}`,
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
      assert
        .dom(
          screen.getByRole('button', {
            name: t('modules.components.publish-module-button.aria-label', { title: 'MON_BEAU_MODULE' }),
          }),
        )
        .exists();
    });
  });

  module('when the draft is an edition of a production module', function () {
    test('it should display schema-shape errors even without a JSON editor on this page', async function (assert) {
      // given: edition drafts show a diff instead of the JSON editor on this page, so Monaco never
      // surfaces schema-shape errors here — this draft only has a schema-shape error stored.
      const productionModule = this.server.create('module', { internalTitle: 'MODULE_PROD' });
      const editionDraft = this.server.create('draft-module', {
        id: crypto.randomUUID(),
        module: productionModule,
        internalTitle: 'MODULE_PROD',
        hasBeenValidated: false,
        validationErrors: [{ message: 'oups !', isSchemaError: true }],
      });

      // when
      const screen = await visit(`/modules/workbench/${editionDraft.id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `${t('modules.components.validation-errors.title', { count: 1 })} ${t('modules.components.validation-errors.information')}`,
          }),
        )
        .exists();
      assert
        .dom(
          screen.queryByRole('button', {
            name: t('modules.components.publish-module-button.aria-label', { title: 'MODULE_PROD' }),
          }),
        )
        .doesNotExist();
    });

    test('it should display a publish button when there are no errors', async function (assert) {
      // given: a valid edition draft (no stored validation errors) must still show the success state,
      // not be mistakenly flagged as invalid just because this page has no JSON editor.
      const productionModule = this.server.create('module', { internalTitle: 'MODULE_PROD' });
      const editionDraft = this.server.create('draft-module', {
        id: crypto.randomUUID(),
        module: productionModule,
        internalTitle: 'MODULE_PROD',
        hasBeenValidated: true,
        validationErrors: [],
      });

      // when
      const screen = await visit(`/modules/workbench/${editionDraft.id}`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert
        .dom(
          screen.queryByRole('button', {
            name: `${t('modules.components.validation-errors.title', { count: 1 })} ${t('modules.components.validation-errors.information')}`,
          }),
        )
        .doesNotExist();
      assert
        .dom(
          screen.getByRole('button', {
            name: t('modules.components.publish-module-button.aria-label', { title: 'MODULE_PROD' }),
          }),
        )
        .exists();
    });
  });
});
