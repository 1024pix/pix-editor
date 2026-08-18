import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
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

  test('displays a breadcrumb', async function (assert) {
    // when
    const screen = await visit('/modules/production');
    await click(await screen.getByRole('link', { name: t('modules.components.modules-list.detail') }));

    // then
    const breadcrumb = screen.getByRole('navigation');
    assert.dom(within(breadcrumb).getByRole('link', { name: t('modules.breadcrumb.production.label') })).exists();
    assert.dom(within(breadcrumb).getByText(t('modules.breadcrumb.production-module.label'))).exists();

    // WORKAROUND: let some time for monaco-editor to settle
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  module('when user clicks on "Voir le détail"', function () {
    test('displays module details page', async function (assert) {
      // when
      const screen = await visit('/');
      await click(await screen.getByRole('link', { name: 'Modules' }));
      await click(await screen.getByRole('link', { name: t('modules.components.modules-tabs.production') }));
      await click(await screen.getByRole('link', { name: t('modules.components.modules-list.detail') }));
      // then
      assert.strictEqual(currentURL(), `/modules/production/${id}`);
      assert.dom(screen.getByRole('heading', { name: 'MON_BEAU_MODULE' })).exists();
      assert.dom(screen.getByText(`● ${t('modules.production-module.information-tag')}`)).exists();

      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  module('when user clicks on "Voir le détail du module en prod"', function () {
    test('displays module details page', async function (assert) {
      // when
      const screen = await visit('/');
      await click(await screen.getByRole('link', { name: 'Modules' }));
      await click(await screen.getByRole('link', { name: t('modules.components.modules-list.production-detail') }));

      // then
      assert.strictEqual(currentURL(), `/modules/production/${id}`);

      // WORKAROUND: let some time for monaco-editor to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });
});
