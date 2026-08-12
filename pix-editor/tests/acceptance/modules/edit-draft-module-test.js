import { visit, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'pixeditor/tests/setup-application-rendering';
import { setupMirage } from 'pixeditor/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Modules | Edit Draft Module', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('config', 'default');
    this.server.create('user', { trigram: 'ABC' });

    return authenticateSession();
  });

  test('displays a breadcrumb', async function (assert) {
    // given
    const module = this.server.create('draft-module', {
      id: crypto.randomUUID(),
      internalTitle: 'MODULE_DRAFT',
      validationErrors: [],
    });

    // when
    const screen = await visit(`/modules/workbench/${module.id}/edit`);
    // WORKAROUND: let some time for monaco-editor to settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    // then
    const breadcrumb = screen.getByRole('navigation');
    assert.dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.workbench.label') })).exists();
    assert.dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.draft-module.label') })).exists();
    assert.dom(within(breadcrumb).getByText(t('modules.breadcrumb.edit-draft-module.label'))).exists();
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
      const screen = await visit(`/modules/workbench/${moduleWithErrors.id}/edit`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `${t('modules.components.validation-errors.title')} ${t('modules.components.validation-errors.error-count', { count: 1 })}`,
          }),
        )
        .exists();
    });
  });

  module('when a module has no errors', function () {
    test('it should not display errors', async function (assert) {
      // given
      const module = this.server.create('draft-module', {
        id: crypto.randomUUID(),
        internalTitle: 'MODULE_DRAFT',
        validationErrors: [],
      });

      const screen = await visit(`/modules/workbench/${module.id}/edit`);
      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // then
      assert
        .dom(
          screen.queryByRole('button', {
            name: `${t('modules.components.validation-errors.title')} ${t('modules.components.validation-errors.error-count', { count: 1 })}`,
          }),
        )
        .doesNotExist();
    });
  });
});
